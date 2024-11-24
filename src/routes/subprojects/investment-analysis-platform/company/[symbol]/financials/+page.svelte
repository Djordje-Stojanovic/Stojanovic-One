<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { session } from '$lib/stores/sessionStore';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ListName } from '$lib/constants/listNames';
    import type { ChartMetric } from '$lib/components/financials/types';
    import StockPageButton from '$lib/components/StockPageButton.svelte';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import FinancialStatementTables from '$lib/components/financials/FinancialStatementTables.svelte';
    import FinancialChart from '$lib/components/financials/FinancialChart.svelte';
    import UserStockSearch from '$lib/components/financials/UserStockSearch.svelte';
    import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
    import { findCompanyList, fetchCompanyName, loadFinancialData } from '$lib/services/companyFinancialsService';
    import { loadShowChart, saveShowChart, loadSelectedMetrics, saveSelectedMetrics } from '$lib/components/financials/state/chartState';

    let symbol: string;
    $: symbol = $page.params.symbol;

    let financialData: FinancialData = {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    };
    let allFinancialData: FinancialData = {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    };
    let loading = false;
    let error: string | null = null;
    let numberFormat: NumberFormat = 'abbreviated';
    let selectedYears = 10;
    let activeTab: 'income' | 'balance' | 'cashflow' = 'income';
    let companyName: string | null = null;
    let companyList: ListName | null = null;
    let selectedPeriod: 'annual' | 'quarterly' | 'ttm' = 'annual';
    let tablesComponent: FinancialStatementTables;

    // Chart state
    let showChart = loadShowChart();
    let selectedMetrics: ChartMetric[] = [];
    let selectedMetricNames: string[] = loadSelectedMetrics();

    function clearChartState() {
        selectedMetrics = [];
        selectedMetricNames = [];
        showChart = false;
        saveShowChart(false);
        saveSelectedMetrics([]);
    }

    function updateChartMetrics() {
        if (selectedMetricNames.length > 0 && financialData) {
            const statements = activeTab === 'income' ? financialData.income_statements :
                             activeTab === 'balance' ? financialData.balance_sheets :
                             financialData.cash_flow_statements;

            selectedMetrics = selectedMetricNames.map(name => {
                const data = statements.map(statement => ({
                    date: statement.date,
                    value: statement[name.toLowerCase() as keyof typeof statement] as number
                })).filter(d => typeof d.value === 'number');

                return { name, data };
            });
        }
    }

    async function handleLoadFinancialData(forceRefresh = false) {
        if (!$session) {
            const returnUrl = encodeURIComponent($page.url.pathname);
            goto(`/login?returnUrl=${returnUrl}`);
            return;
        }

        loading = true;
        error = null;

        const result = await loadFinancialData(symbol, $session.access_token, forceRefresh);
        
        if (result.error) {
            error = result.error;
        } else if (result.data) {
            allFinancialData = result.data;
            financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
            if (tablesComponent) {
                setTimeout(() => {
                    try {
                        tablesComponent.scrollToRight();
                    } catch (e) {
                        console.warn('Could not scroll tables:', e);
                    }
                }, 100);
            }
            updateChartMetrics();
        }
        
        loading = false;
    }

    // Watch for symbol changes and reload data
    $: if (symbol && $session) {
        Promise.all([
            handleLoadFinancialData(),
            fetchCompanyName(symbol).then(name => companyName = name),
            findCompanyList(symbol).then(list => companyList = list)
        ]);
    }

    onMount(async () => {
        if ($session && symbol) {
            await Promise.all([
                handleLoadFinancialData(),
                fetchCompanyName(symbol).then(name => companyName = name),
                findCompanyList(symbol).then(list => companyList = list)
            ]);
        }
    });

    // Update filtered data when selectedYears or selectedPeriod changes
    $: {
        if (allFinancialData && allFinancialData.income_statements.length > 0) {
            financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
            updateChartMetrics();
        }
    }

    function navigateToFullpage() {
        if (companyList) {
            goto(`/subprojects/investment-analysis-platform/${companyList.toLowerCase()}/${symbol.toLowerCase()}`);
        }
    }

    function handleMetricClick(event: CustomEvent<{ name: string; values: number[]; dates: string[] }>) {
        const { name, values, dates } = event.detail;
        
        const existingIndex = selectedMetricNames.indexOf(name);
        
        if (existingIndex !== -1) {
            selectedMetrics = selectedMetrics.filter(m => m.name !== name);
            selectedMetricNames = selectedMetricNames.filter(n => n !== name);
        } else {
            const newMetric = {
                name,
                data: dates.map((date, i) => ({
                    date,
                    value: values[i]
                }))
            };
            selectedMetrics = [...selectedMetrics, newMetric];
            selectedMetricNames = [...selectedMetricNames, name];
        }

        showChart = selectedMetrics.length > 0;
        saveShowChart(showChart);
        saveSelectedMetrics(selectedMetricNames);
    }

    // Check if there's any data for the current tab
    $: hasData = activeTab === 'income' ? financialData.income_statements.length > 0 :
                 activeTab === 'balance' ? financialData.balance_sheets.length > 0 :
                 financialData.cash_flow_statements.length > 0;
</script>

<div class="min-h-screen bg-white dark:bg-[#1F2937] p-4 space-y-4">
    <!-- Navigation Buttons -->
    <div class="flex space-x-4 mb-6">
        <StockPageButton onClick={() => goto('/subprojects/investment-analysis-platform')}>
            Go to IAP
        </StockPageButton>

        {#if companyList}
            <StockPageButton onClick={navigateToFullpage}>
                Go to Fullpage
            </StockPageButton>
        {/if}

        <StockPageButton onClick={() => goto(`/subprojects/investment-analysis-platform/company/${symbol}`)}>
            Wiki
        </StockPageButton>

        <StockPageButton variant="disabled">
            Financials
        </StockPageButton>
    </div>

    <!-- Stock Search -->
    <div class="mb-6">
        <UserStockSearch />
    </div>

    <FinancialsHeader
        {symbol}
        {companyName}
        {loading}
        {numberFormat}
        {selectedYears}
        period={selectedPeriod}
        on:refresh={() => handleLoadFinancialData(true)}
        on:formatChange={(e) => numberFormat = e.detail}
        on:yearChange={(e) => selectedYears = e.detail.years}
        on:periodChange={(e) => selectedPeriod = e.detail.period}
    />

    {#if showChart && selectedMetrics.length > 0}
        <div class="mb-4 bg-white dark:bg-[#1F2937] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="flex justify-end">
                <button 
                    class="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                    on:click={clearChartState}
                >
                    Close Chart
                </button>
            </div>
            <FinancialChart 
                metrics={selectedMetrics}
                showGrowthRates={selectedPeriod === 'ttm'}
            />
        </div>
    {/if}

    {#if !hasData && !loading && !error}
        <div class="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-lg" role="alert">
            <strong class="font-bold">No Data Available!</strong>
            <span class="block sm:inline ml-2">No financial data found for {symbol}</span>
        </div>
    {/if}

    <FinancialStatementTables
        bind:this={tablesComponent}
        bind:activeTab
        {loading}
        {error}
        {financialData}
        {numberFormat}
        {selectedMetricNames}
        on:metricClick={handleMetricClick}
    />
</div>
