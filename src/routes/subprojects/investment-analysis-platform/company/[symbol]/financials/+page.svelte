<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { session } from '$lib/stores/sessionStore';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData, FinancialPeriod } from '$lib/types/financialStatements';
    import type { ListName } from '$lib/constants/listNames';
    import { loadFinancialPageData, loadStockPriceData } from '$lib/services/financialPageService';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import type { StockPrice } from '$lib/types/stockPrices';
    import { handleValuationMetricClick, updateMetricData } from '$lib/components/financials/valuation/utils/metricHandlers';
    import { chartStore } from '$lib/stores/chartStore';
    import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
    import { loadSelectedPeriod, saveSelectedPeriod, loadSelectedYears, saveSelectedYears } from '$lib/components/financials/state/chartState';
    import FinancialDataDisplay from './components/FinancialDataDisplay.svelte';
    import FinancialChartDisplay from './components/FinancialChartDisplay.svelte';
    import FinancialTableDisplay from './components/FinancialTableDisplay.svelte';

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
    let selectedPeriod: 'annual' | 'quarterly' | 'ttm' = 'annual';

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
        
        // Handle the metric click
        chartStore.handleMetricClick(name, values, dates);
    }

    let isDefaultViewClicked = false;

    async function handleDefaultView() {
        // Keep current selected years
        chartStore.setSelectedYears(selectedYears);

        // Update filtered data
        financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);

        // Clear existing metrics
        chartStore.clearChart();

        // Add all metrics at once
        if (financialData.income_statements?.length > 0) {
            const dates = financialData.income_statements.map(s => s.date);
            
            // Add base metrics
            const metrics = [
                {
                    name: 'Revenue',
                    values: financialData.income_statements.map(s => 
                        typeof s.revenue === 'string' ? parseFloat(s.revenue) : (s.revenue || 0)
                    )
                },
                {
                    name: 'Net Income',
                    values: financialData.income_statements.map(s => 
                        typeof s.netIncome === 'string' ? parseFloat(s.netIncome) : (s.netIncome || 0)
                    )
                }
            ];

            // Add Free Cash Flow if available
            if (financialData.cash_flow_statements?.length > 0) {
                metrics.push({
                    name: 'Free Cash Flow',
                    values: dates.map(date => {
                        const cf = financialData.cash_flow_statements.find(cf => cf.date === date);
                        const value = cf?.freeCashFlow;
                        return typeof value === 'string' ? parseFloat(value) : (value || 0);
                    })
                });
            }

            // Add base metrics all at once
            metrics.forEach(metric => {
                handleMetricClick(new CustomEvent('metricClick', {
                    detail: {
                        name: metric.name,
                        values: metric.values,
                        dates
                    }
                }));
            });

            // Add ROIC immediately after
            chartStore.toggleReturnMetric('roic');

            // Start loading price data in parallel
            const pricesPromise = getHistoricalPrices(symbol, selectedYears);

            // Small delay to ensure base metrics are processed
            await new Promise(resolve => setTimeout(resolve, 100));

            // Add Stock Price once data is loaded
            const prices = await pricesPromise;
            if (prices.length > 0) {
                const priceValues = prices.map((p: StockPrice) => p.adj_close ?? 0);
                const priceDates = prices.map((p: StockPrice) => p.date);
                chartStore.handleMetricClick('Stock Price', priceValues, priceDates);

                // Add P/E Ratio right after Stock Price
                await new Promise(resolve => setTimeout(resolve, 50));
                await handleValuationMetricClick('pe', symbol, selectedYears, financialData);
            }
        }
    }

    async function handlePeriodChange(event: CustomEvent<{ period: 'annual' | 'quarterly' | 'ttm' }>) {
        selectedPeriod = event.detail.period;
        saveSelectedPeriod(selectedPeriod);
        updateData();

        // Update price-based metrics if they're selected
        const hasStockPrice = $chartStore.selectedMetricNames.includes('Stock Price');
        const hasPERatio = $chartStore.valuationMetrics.pe;

        if (hasStockPrice || hasPERatio) {
            const prices = await getHistoricalPrices(symbol, selectedYears);
            if (prices.length > 0) {
                if (hasStockPrice) {
                    const priceValues = prices.map((p: StockPrice) => p.adj_close ?? 0);
                    const priceDates = prices.map((p: StockPrice) => p.date);
                    chartStore.handleMetricClick('Stock Price', priceValues, priceDates);
                }
                if (hasPERatio) {
                    await updateMetricData('pe', symbol, selectedYears, financialData);
                }
            }
        }
    }

    async function handleYearChange(event: CustomEvent<{ years: number }>) {
        selectedYears = event.detail.years;
        saveSelectedYears(selectedYears);
        chartStore.setSelectedYears(selectedYears);
        updateData();

        // Update price-based metrics if they're selected
        const hasStockPrice = $chartStore.selectedMetricNames.includes('Stock Price');
        const hasPERatio = $chartStore.valuationMetrics.pe;

        if (hasStockPrice || hasPERatio) {
            const prices = await getHistoricalPrices(symbol, selectedYears);
            if (prices.length > 0) {
                if (hasStockPrice) {
                    const priceValues = prices.map((p: StockPrice) => p.adj_close ?? 0);
                    const priceDates = prices.map((p: StockPrice) => p.date);
                    chartStore.handleMetricClick('Stock Price', priceValues, priceDates);
                }
                if (hasPERatio) {
                    await updateMetricData('pe', symbol, selectedYears, financialData);
                }
            }
        }
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
</script>

<FinancialDataDisplay
    {symbol}
    {companyName}
    {companyList}
    {loading}
    {numberFormat}
    {selectedYears}
    period={selectedPeriod}
    {financialData}
    on:sync={handleSync}
    on:formatChange={(e) => numberFormat = e.detail}
    on:yearChange={handleYearChange}
    on:periodChange={handlePeriodChange}
    on:defaultView={handleDefaultView}
>
    <FinancialChartDisplay
        {financialData}
        on:metricClick={handleMetricClick}
    />

    <FinancialTableDisplay
        {loading}
        {error}
        {financialData}
        {numberFormat}
        bind:activeTab
        selectedMetricNames={$chartStore.selectedMetricNames}
        on:metricClick={handleMetricClick}
    />
</FinancialDataDisplay>
