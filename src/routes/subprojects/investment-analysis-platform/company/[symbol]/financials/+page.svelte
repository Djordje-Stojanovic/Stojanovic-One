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
    import { loadFinancialPageData, loadStockPriceData } from '$lib/services/financialPageService';
    import { chartStore } from '$lib/stores/chartStore';
    import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
    import { loadSelectedPeriod, saveSelectedPeriod, loadSelectedYears, saveSelectedYears } from '$lib/components/financials/state/chartState';

    let symbol = $page.params.symbol;
    let financialData: FinancialData = { 
        income_statements: [], 
        balance_sheets: [], 
        cash_flow_statements: [], 
        revenue_segments: [],
        revenue_geo_segments: []
    };
    let allFinancialData: FinancialData = { 
        income_statements: [], 
        balance_sheets: [], 
        cash_flow_statements: [], 
        revenue_segments: [],
        revenue_geo_segments: []
    };
    let loading = false;
    let error: string | null = null;
    let numberFormat: NumberFormat = 'abbreviated';
    let selectedYears = loadSelectedYears();
    let activeTab: 'income' | 'balance' | 'cashflow' | 'segments' | 'geo_segments' = 'income';
    let companyName: string | null = null;
    let companyList: ListName | null = null;
    let selectedPeriod: 'annual' | 'quarterly' | 'ttm' = loadSelectedPeriod();
    let tablesComponent: FinancialStatementTables;

    async function loadData(forceRefresh = false) {
        if (!$session) return;
        
        loading = true;
        error = null;

        // Only load financial data initially, not stock prices
        const financialResult = await loadFinancialPageData(
            symbol,
            $session.access_token,
            selectedPeriod,
            selectedYears,
            forceRefresh
        );

        ({ financialData, allFinancialData, companyName, companyList, error } = financialResult);
        
        if (!error && financialData) {
            console.log('Loaded financial data:', financialData);
            chartStore.updateMetrics(financialData);
        }

        loading = false;
    }

    // Separate function to handle sync button click
    async function handleSync() {
        if (!$session) return;
        
        loading = true;
        error = null;

        // Load both financial and stock price data when sync is clicked
        const [financialResult, stockPriceResult] = await Promise.all([
            loadFinancialPageData(
                symbol,
                $session.access_token,
                selectedPeriod,
                selectedYears,
                true
            ),
            loadStockPriceData(
                symbol,
                $session.access_token,
                true
            )
        ]);

        ({ financialData, allFinancialData, companyName, companyList, error } = financialResult);
        
        if (!error && financialData) {
            console.log('Loaded financial data:', financialData);
            chartStore.updateMetrics(financialData);
        }

        if (stockPriceResult.error) {
            console.error('Error loading stock prices:', stockPriceResult.error);
        } else if (stockPriceResult.stockPrices) {
            console.log('Loaded stock prices:', stockPriceResult.stockPrices);
        }

        loading = false;
    }

    function updateData() {
        if (!allFinancialData?.income_statements.length) return;
        
        financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
        console.log('Filtered financial data:', financialData);
        chartStore.updateMetrics(financialData);
    }

    function handleMetricClick(event: CustomEvent<{ name: string; values: number[]; dates: string[] }>) {
        const { name, values, dates } = event.detail;
        console.log('Metric clicked:', { name, values, dates });
        
        // First update the financial data in the store
        chartStore.updateMetrics(financialData);
        
        // Then handle the metric click
        chartStore.handleMetricClick(name, values, dates);
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

    // Watch for symbol changes - only load financial data, not stock prices
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        loadData(false); // Load financial data without force refresh
    }

    // Watch for tab changes
    $: if (activeTab && financialData) {
        console.log('Active tab changed:', activeTab);
        chartStore.updateMetrics(financialData);
    }

    onMount(() => {
        if ($session && symbol) {
            loadData(false); // Initial load without force refresh
        }
    });

    $: hasData = (() => {
        switch (activeTab) {
            case 'income':
                return financialData.income_statements.length > 0;
            case 'balance':
                return financialData.balance_sheets.length > 0;
            case 'cashflow':
                return financialData.cash_flow_statements.length > 0;
            case 'segments':
                return (financialData.revenue_segments || []).length > 0;
            case 'geo_segments':
                return (financialData.revenue_geo_segments || []).length > 0;
            default:
                return false;
        }
    })();
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
        on:sync={handleSync}
        on:formatChange={(e) => numberFormat = e.detail}
        on:yearChange={handleYearChange}
        on:periodChange={handlePeriodChange}
    />

    <ChartSection {allFinancialData} />

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
