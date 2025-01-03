<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { page } from '$app/stores';
    import { db } from '$lib/supabaseClient';
    import type { ValuationMetricType } from '$lib/stores/financial-charts/types/ChartTypes';
    import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
    import type { ValuationMetricState } from '$lib/stores/financial-charts/types/ChartTypes';

    interface TTMEpsData {
        date: string;
        eps_diluted: number;
        period?: string;
    }

    let symbol = $page.params.symbol;
    let loadingMetric: ValuationMetricType | null = null;
    let errorMetric: ValuationMetricType | null = null;
    let valuationMetrics: ValuationMetricState = {
        pe: false,
        fcfYield: false,
        ps: false,
        evEbitda: false,
        pgp: false
    };
    let financialData: FinancialData | null = null;

    $: {
        valuationMetrics = $chartStore.valuationMetrics;
        financialData = $chartStore.lastFinancialData;
    }

    async function handleMetricClick(metricName: string, valuationType: ValuationMetricType) {
        if (loadingMetric) return;
        
        try {
            loadingMetric = valuationType;

            if (valuationType === 'pe') {
                if (!valuationMetrics.pe) {
                    // Get stock prices
                    const { data: prices } = await db.from('stock_prices')
                        .select('*')
                        .eq('symbol', symbol)
                        .order('date', { ascending: true });

                    if (!prices?.length || !financialData?.income_statements.length) {
                        throw new Error('No data available');
                    }

                    // Get TTM EPS data
                    let ttmEpsData: TTMEpsData[] = financialData.income_statements
                        .filter(stmt => stmt.period === 'TTM')
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    // If no TTM data found, calculate it manually
                    if (!ttmEpsData.length) {
                        const quarterlyData = financialData.income_statements
                            .filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM')
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        ttmEpsData = (quarterlyData as IncomeStatement[])
                            .map((stmt: IncomeStatement, index: number, arr: IncomeStatement[]) => {
                                if (index < 3) return null;
                                
                                // Get last 4 quarters
                                const last4Quarters = arr.slice(index - 3, index + 1);
                                
                                // Sum EPS for last 4 quarters
                                const ttmEps = last4Quarters
                                    .reduce((sum: number, q: IncomeStatement) => sum + (q.eps_diluted || 0), 0);
                                
                                return {
                                    date: stmt.date,
                                    eps_diluted: ttmEps
                                };
                            })
                            .filter((d): d is TTMEpsData => d !== null)
                            .sort((a: TTMEpsData, b: TTMEpsData) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (!ttmEpsData.length) {
                            throw new Error('Could not calculate TTM data');
                        }
                    }

                    // Calculate P/E ratio for each price point
                    const peData = prices.map(price => {
                        const priceDate = new Date(price.date);
                        
                        // Find the most recent TTM EPS data point before or equal to this price date
                        const validEps = ttmEpsData.find(stmt => 
                            new Date(stmt.date) <= priceDate
                        );

                        // Only calculate P/E if we have valid EPS (non-zero and not negative)
                        if (validEps?.eps_diluted && validEps.eps_diluted > 0) {
                            const peRatio = price.adj_close / validEps.eps_diluted;
                            // Filter out unreasonable P/E ratios (e.g., > 1000)
                            if (peRatio > 0 && peRatio < 1000) {
                                return {
                                    date: price.date,
                                    value: peRatio
                                };
                            }
                        }
                        return null;
                    })
                    .filter(d => d !== null)
                    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

                    if (!peData.length) {
                        throw new Error('No valid P/E data available');
                    }

                    const values = peData.map(d => d!.value);
                    const dates = peData.map(d => d!.date);

                    chartStore.handleMetricClick('P/E Ratio', values, dates);
                    chartStore.toggleValuationMetric('pe');
                } else {
                    chartStore.handleMetricClick('P/E Ratio', [], []);
                    chartStore.toggleValuationMetric('pe');
                }
            }
        } catch (error) {
            console.error('Error in handleMetricClick:', error);
            errorMetric = valuationType;
            setTimeout(() => {
                errorMetric = null;
            }, 2000);
        } finally {
            loadingMetric = null;
        }
    }

    // Reset when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        if (valuationMetrics.pe) {
            chartStore.handleMetricClick('P/E Ratio', [], []);
            chartStore.toggleValuationMetric('pe');
        }
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!loadingMetric && 'hover:bg-opacity-10'} focus:outline-none {loadingMetric ? 'cursor-wait opacity-50' : errorMetric === 'pe' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
            style="color: rgb(147, 51, 234); background-color: {valuationMetrics.pe ? 'rgba(147, 51, 234, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('P/E Ratio', 'pe')}
            disabled={loadingMetric === 'pe' || errorMetric === 'pe'}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(147, 51, 234);"></span>
            <span class="relative">
                P/E Ratio {#if loadingMetric === 'pe'}...{:else if errorMetric === 'pe'}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        No valid P/E data
                    </span>
                    ❌
                {/if}
            </span>
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!loadingMetric && 'hover:bg-opacity-10'} focus:outline-none {loadingMetric ? 'cursor-wait opacity-50' : errorMetric === 'fcfYield' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
            style="color: rgb(6, 182, 212); background-color: {valuationMetrics.fcfYield ? 'rgba(6, 182, 212, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('FCF Yield', 'fcfYield')}
            disabled={loadingMetric === 'fcfYield' || errorMetric === 'fcfYield'}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(6, 182, 212);"></span>
            <span class="relative">
                FCF Yield {#if loadingMetric === 'fcfYield'}...{:else if errorMetric === 'fcfYield'}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        No valid FCF data
                    </span>
                    ❌
                {/if}
            </span>
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!loadingMetric && 'hover:bg-opacity-10'} focus:outline-none {loadingMetric ? 'cursor-wait opacity-50' : errorMetric === 'ps' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
            style="color: rgb(245, 158, 11); background-color: {valuationMetrics.ps ? 'rgba(245, 158, 11, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('P/S Ratio', 'ps')}
            disabled={loadingMetric === 'ps' || errorMetric === 'ps'}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(245, 158, 11);"></span>
            <span class="relative">
                P/S Ratio {#if loadingMetric === 'ps'}...{:else if errorMetric === 'ps'}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        No valid P/S data
                    </span>
                    ❌
                {/if}
            </span>
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!loadingMetric && 'hover:bg-opacity-10'} focus:outline-none {loadingMetric ? 'cursor-wait opacity-50' : errorMetric === 'evEbitda' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
            style="color: rgb(59, 130, 246); background-color: {valuationMetrics.evEbitda ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('EV/EBITDA', 'evEbitda')}
            disabled={loadingMetric === 'evEbitda' || errorMetric === 'evEbitda'}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(59, 130, 246);"></span>
            <span class="relative">
                EV/EBITDA {#if loadingMetric === 'evEbitda'}...{:else if errorMetric === 'evEbitda'}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        No valid EV/EBITDA data
                    </span>
                    ❌
                {/if}
            </span>
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!loadingMetric && 'hover:bg-opacity-10'} focus:outline-none {loadingMetric ? 'cursor-wait opacity-50' : errorMetric === 'pgp' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
            style="color: rgb(16, 185, 129); background-color: {valuationMetrics.pgp ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('P/GP Ratio', 'pgp')}
            disabled={loadingMetric === 'pgp' || errorMetric === 'pgp'}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(16, 185, 129);"></span>
            <span class="relative">
                P/GP Ratio {#if loadingMetric === 'pgp'}...{:else if errorMetric === 'pgp'}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        No valid P/GP data
                    </span>
                    ❌
                {/if}
            </span>
        </button>
    </div>
</div>
