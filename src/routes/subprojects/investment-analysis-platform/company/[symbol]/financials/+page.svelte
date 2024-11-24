<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { session } from '$lib/stores/sessionStore';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ListName } from '$lib/constants/listNames';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import FinancialStatementTables from '$lib/components/financials/FinancialStatementTables.svelte';
    import UserStockSearch from '$lib/components/financials/UserStockSearch.svelte';
    import ChartSection from '$lib/components/financials/ChartSection.svelte';
    import FinancialNavigation from '$lib/components/financials/FinancialNavigation.svelte';
    import { loadFinancialPageData } from '$lib/services/financialPageService';
    import { chartStore } from '$lib/stores/chartStore';
    import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
    import { loadSelectedPeriod, saveSelectedPeriod, loadSelectedYears, saveSelectedYears } from '$lib/components/financials/state/chartState';

    let symbol = $page.params.symbol;
    let financialData: FinancialData = { income_statements: [], balance_sheets: [], cash_flow_statements: [] };
    let allFinancialData: FinancialData = { income_statements: [], balance_sheets: [], cash_flow_statements: [] };
    let loading = false;
    let error: string | null = null;
    let numberFormat: NumberFormat = 'abbreviated';
    let selectedYears = loadSelectedYears();
    let activeTab: 'income' | 'balance' | 'cashflow' = 'income';
    let companyName: string | null = null;
    let companyList: ListName | null = null;
    let selectedPeriod: 'annual' | 'quarterly' | 'ttm' = loadSelectedPeriod();
    let tablesComponent: FinancialStatementTables;

    async function loadData(forceRefresh = false) {
        if (!$session) return;
        
        loading = true;
        error = null;

        const result = await loadFinancialPageData(
            symbol,
            $session.access_token,
            selectedPeriod,
            selectedYears,
            forceRefresh
        );

        ({ financialData, allFinancialData, companyName, companyList, error } = result);
        
        if (!error && financialData) {
            chartStore.updateMetrics(financialData);
        }

        loading = false;
    }

    function updateData() {
        if (!allFinancialData?.income_statements.length) return;
        
        financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
        chartStore.updateMetrics(financialData);
    }

    function handleMetricClick(event: CustomEvent<{ name: string; values: number[]; dates: string[] }>) {
        chartStore.handleMetricClick(event.detail.name, event.detail.values, event.detail.dates);
    }

    function handlePeriodChange(event: CustomEvent<{ period: 'annual' | 'quarterly' | 'ttm' }>) {
        selectedPeriod = event.detail.period;
        saveSelectedPeriod(selectedPeriod);
        updateData();
    }

    function handleYearChange(event: CustomEvent<{ years: number }>) {
        selectedYears = event.detail.years;
        saveSelectedYears(selectedYears);
        updateData();
    }

    // Watch for symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        loadData();
    }

    // Watch for tab changes
    $: if (activeTab && financialData) {
        chartStore.updateMetrics(financialData);
    }

    onMount(() => {
        if ($session && symbol) {
            loadData();
        }
    });

    $: hasData = activeTab === 'income' ? financialData.income_statements.length > 0 :
                 activeTab === 'balance' ? financialData.balance_sheets.length > 0 :
                 financialData.cash_flow_statements.length > 0;
</script>

<div class="min-h-screen bg-white dark:bg-[#1F2937] p-4 space-y-4">
    <FinancialNavigation {symbol} {companyList} />
    
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
        on:refresh={() => loadData(true)}
        on:formatChange={(e) => numberFormat = e.detail}
        on:yearChange={handleYearChange}
        on:periodChange={handlePeriodChange}
    />

    <ChartSection {selectedPeriod} />

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
        selectedMetricNames={$chartStore.selectedMetricNames}
        on:metricClick={handleMetricClick}
    />
</div>
