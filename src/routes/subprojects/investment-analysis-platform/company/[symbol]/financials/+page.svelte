<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { session } from '$lib/stores/sessionStore';
    import { supabase } from '$lib/supabaseClient';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ListName } from '$lib/constants/listNames';
    import type { ChartMetric } from '$lib/components/financials/types';
    import StockPageButton from '$lib/components/StockPageButton.svelte';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import FinancialStatementTables from '$lib/components/financials/FinancialStatementTables.svelte';
    import FinancialChart from '$lib/components/financials/FinancialChart.svelte';
    import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
    import { findCompanyList, fetchCompanyName, loadFinancialData } from '$lib/services/companyFinancialsService';

    const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#06B6D4', // cyan
        '#F97316'  // orange
    ];

    const symbol = $page.params.symbol;
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
    let selectedPeriod: 'annual' | 'quarterly' = 'annual';
    let tablesComponent: FinancialStatementTables;

    // Chart state
    let showChart = false;
    let selectedMetrics: ChartMetric[] = [];
    let selectedMetricNames: string[] = [];

    function clearChartState() {
        selectedMetrics = [];
        selectedMetricNames = [];
        showChart = false;
    }

    async function handleLoadFinancialData(forceRefresh = false) {
        if (!$session) {
            const returnUrl = encodeURIComponent($page.url.pathname);
            goto(`/login?returnUrl=${returnUrl}`);
            return;
        }

        loading = true;
        error = null;

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
            error = 'No active session';
            loading = false;
            return;
        }

        const result = await loadFinancialData(symbol, currentSession.access_token, forceRefresh);
        
        if (result.error) {
            error = result.error;
        } else if (result.data) {
            allFinancialData = result.data;
            financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
            if (tablesComponent) {
                setTimeout(() => tablesComponent.scrollToRight(), 100);
            }
        }
        
        loading = false;
    }

    onMount(async () => {
        if ($session) {
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
        }
    }

    // Scroll to right when switching tabs
    $: if (activeTab && tablesComponent) {
        setTimeout(() => tablesComponent.scrollToRight(), 100);
    }

    function navigateToFullpage() {
        if (companyList) {
            goto(`/subprojects/investment-analysis-platform/${companyList.toLowerCase()}/${symbol.toLowerCase()}`);
        }
    }

    function handleMetricClick(event: CustomEvent<{ name: string; values: number[]; dates: string[] }>) {
        const { name, values, dates } = event.detail;
        
        // Find if metric is already selected
        const existingIndex = selectedMetrics.findIndex(m => m.name === name);
        
        if (existingIndex !== -1) {
            // Remove metric if already selected
            selectedMetrics = selectedMetrics.filter(m => m.name !== name);
            selectedMetricNames = selectedMetricNames.filter(n => n !== name);
        } else {
            // Add new metric
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
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-4">
                    {#each selectedMetrics as metric, i}
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full" style="background-color: {colors[i % colors.length]}"></span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</span>
                        </div>
                    {/each}
                </div>
                <button 
                    class="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                    on:click={clearChartState}
                >
                    Close Chart
                </button>
            </div>
            <FinancialChart 
                metrics={selectedMetrics}
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
