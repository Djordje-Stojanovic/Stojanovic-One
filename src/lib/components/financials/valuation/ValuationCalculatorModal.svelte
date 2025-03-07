<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
    import { formatCurrency, formatNumber, formatPercentage } from '$lib/utils/numberFormat';
    
    export let loading = false;
    export let financialData: FinancialData;
    export let stockMetadata: any = null;
    
    const dispatch = createEventDispatcher();
    
    // Extract last 5 years of annual financial data
    $: annualStatements = financialData?.income_statements
        ?.filter(stmt => stmt.period === 'FY')
        ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        ?.slice(0, 5)
        ?.reverse() || [];
    
    // Calculate YoY changes
    $: yoyRevenueChanges = calculateYoYChanges(annualStatements, 'revenue');
    $: yoyNetIncomeChanges = calculateYoYChanges(annualStatements, 'net_income');
    
    // Future projections (next 5 years)
    let futureRevenueGrowth: number[] = Array(5).fill(0.1); // Default 10% growth
    let futureNetIncomeGrowth: number[] = Array(5).fill(0.1); // Default 10% growth
    let futurePERatio = stockMetadata?.pe_ratio || 20;
    
    // Calculate future years based on the last available year
    $: futureYears = calculateFutureYears(annualStatements);
    
    // Calculate future values based on growth rates
    $: futureRevenues = calculateFutureValues(
        annualStatements.length > 0 ? annualStatements[annualStatements.length - 1].revenue as number : 0,
        futureRevenueGrowth
    );
    
    $: futureNetIncomes = calculateFutureValues(
        annualStatements.length > 0 ? annualStatements[annualStatements.length - 1].net_income as number : 0,
        futureNetIncomeGrowth
    );
    
    // Calculate future market cap, upside/downside, and CAGR
    $: futureMarketCap = calculateFutureMarketCap(futureNetIncomes[4], futurePERatio);
    $: upsideDownside = calculateUpsideDownside(futureMarketCap, stockMetadata?.market_cap);
    $: cagr = calculateCAGR(upsideDownside);
    
    // Initialize growth rates based on historical data
    onMount(() => {
        if (annualStatements.length > 0) {
            // Calculate average growth rates from historical data
            const avgRevenueGrowth = calculateAverageGrowth(yoyRevenueChanges);
            const avgNetIncomeGrowth = calculateAverageGrowth(yoyNetIncomeChanges);
            
            // Initialize growth rates with historical averages
            futureRevenueGrowth = Array(5).fill(avgRevenueGrowth);
            futureNetIncomeGrowth = Array(5).fill(avgNetIncomeGrowth);
            
            // Initialize future P/E ratio with current P/E ratio or default to 20
            futurePERatio = stockMetadata?.pe_ratio || 20;
        }
    });
    
    function calculateYoYChanges(statements: IncomeStatement[], field: string): number[] {
        if (!statements || statements.length < 2) return [];
        
        // Calculate YoY changes (current year compared to previous year)
        const changes = [];
        
        for (let i = 1; i < statements.length; i++) {
            const currentValue = statements[i][field] as number;
            const previousValue = statements[i-1][field] as number;
            
            if (!previousValue || previousValue === 0) {
                changes.push(0);
            } else {
                changes.push((currentValue - previousValue) / previousValue);
            }
        }
        
        return changes;
    }
    
    function calculateFutureYears(statements: IncomeStatement[]): string[] {
        if (!statements || statements.length === 0) return Array(5).fill('').map((_, i) => `Year ${i+1}`);
        
        const lastYear = new Date(statements[statements.length - 1].date).getFullYear();
        return Array(5).fill(0).map((_, i) => (lastYear + i + 1).toString());
    }
    
    function calculateFutureValues(lastHistoricalValue: number, growthRates: number[]): number[] {
        let result: number[] = [];
        let currentValue = lastHistoricalValue;
        
        for (let i = 0; i < growthRates.length; i++) {
            currentValue = currentValue * (1 + growthRates[i]);
            result.push(currentValue);
        }
        
        return result;
    }
    
    function calculateAverageGrowth(growthRates: number[]): number {
        if (!growthRates || growthRates.length === 0) return 0.1; // Default to 10% if no data
        
        // Filter out any NaN or infinite values
        const validRates = growthRates.filter(rate => isFinite(rate) && !isNaN(rate));
        
        if (validRates.length === 0) return 0.1; // Default to 10% if no valid data
        
        const sum = validRates.reduce((acc, rate) => acc + rate, 0);
        return sum / validRates.length;
    }
    
    function calculateFutureMarketCap(futureNetIncome: number, pe: number): number {
        return futureNetIncome * pe;
    }
    
    function calculateUpsideDownside(futureMarketCap: number, currentMarketCap: number): number {
        if (!currentMarketCap || currentMarketCap === 0) return 0;
        return (futureMarketCap - currentMarketCap) / currentMarketCap;
    }
    
    function calculateCAGR(upsideDownside: number): number {
        // CAGR = (1 + total_return)^(1/years) - 1
        return Math.pow(1 + upsideDownside, 1/5) - 1;
    }
    
    function handleClose() {
        dispatch('close');
    }
    
    // Track raw input values during editing
    let revenueInputValues: string[] = Array(5).fill('');
    let netIncomeInputValues: string[] = Array(5).fill('');
    
    // Initialize input values from growth rates
    $: {
        if (futureRevenueGrowth.length === 5 && revenueInputValues.every(v => v === '')) {
            revenueInputValues = futureRevenueGrowth.map(rate => formatGrowthRate(rate));
        }
        
        if (futureNetIncomeGrowth.length === 5 && netIncomeInputValues.every(v => v === '')) {
            netIncomeInputValues = futureNetIncomeGrowth.map(rate => formatGrowthRate(rate));
        }
    }
    
    function handleRevenueInputChange(index: number, event: Event) {
        const input = event.target as HTMLInputElement;
        revenueInputValues[index] = input.value;
        revenueInputValues = [...revenueInputValues]; // Trigger reactivity
    }
    
    function handleNetIncomeInputChange(index: number, event: Event) {
        const input = event.target as HTMLInputElement;
        netIncomeInputValues[index] = input.value;
        netIncomeInputValues = [...netIncomeInputValues]; // Trigger reactivity
    }
    
    function updateRevenueGrowth(index: number) {
        let value = revenueInputValues[index];
        
        // Remove % sign if present
        if (value.endsWith('%')) {
            value = value.slice(0, -1);
        }
        
        // Convert to decimal
        const growthRate = parseFloat(value) / 100;
        
        if (!isNaN(growthRate)) {
            futureRevenueGrowth[index] = growthRate;
            futureRevenueGrowth = [...futureRevenueGrowth]; // Trigger reactivity
            // Update the input value with formatted value
            revenueInputValues[index] = formatGrowthRate(growthRate);
            revenueInputValues = [...revenueInputValues];
        }
    }
    
    function updateNetIncomeGrowth(index: number) {
        let value = netIncomeInputValues[index];
        
        // Remove % sign if present
        if (value.endsWith('%')) {
            value = value.slice(0, -1);
        }
        
        // Convert to decimal
        const growthRate = parseFloat(value) / 100;
        
        if (!isNaN(growthRate)) {
            futureNetIncomeGrowth[index] = growthRate;
            futureNetIncomeGrowth = [...futureNetIncomeGrowth]; // Trigger reactivity
            // Update the input value with formatted value
            netIncomeInputValues[index] = formatGrowthRate(growthRate);
            netIncomeInputValues = [...netIncomeInputValues];
        }
    }
    
    function handleKeyDown(event: KeyboardEvent, type: 'revenue' | 'netIncome', index: number) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (type === 'revenue') {
                updateRevenueGrowth(index);
            } else {
                updateNetIncomeGrowth(index);
            }
            // Remove focus from the input
            (event.target as HTMLInputElement).blur();
        }
    }
    
    // Format growth rate for display
    function formatGrowthRate(rate: number): string {
        return (rate * 100).toFixed(2) + '%';
    }
    
    // Handle focus event to select all text
    function handleFocus(event: FocusEvent) {
        if (event.target instanceof HTMLInputElement) {
            event.target.select();
        }
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col">
        <div class="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Valuation Calculator</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stockMetadata ? stockMetadata.symbol : ''}
                </p>
            </div>
            <button 
                on:click={handleClose}
                class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="px-6 pb-6 overflow-y-auto flex-grow">
            {#if loading}
                <div class="flex flex-col items-center justify-center space-y-4 py-8">
                    <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-gray-600 dark:text-gray-300">Loading Data...</p>
                </div>
            {:else}
                <div class="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-lg dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 transition-colors">
                    <div class="relative">
                        <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-2 flex justify-between items-center">
                            Historical Data (Last 5 Years)
                        </h3>
                    </div>
                    
                    <!-- Historical Data Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs uppercase bg-gray-200 dark:bg-gray-700">
                                <tr>
                                    <th class="px-4 py-2 w-40">Metric</th>
                                    {#each annualStatements as stmt}
                                        <th class="px-4 py-2 text-center">{new Date(stmt.date).getFullYear()}</th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white dark:bg-gray-800">
                                    <td class="px-4 py-2 font-medium">Revenue</td>
                                    {#each annualStatements as stmt}
                                        <td class="px-4 py-2 text-center">{formatCurrency(stmt.revenue, 'abbreviated').formatted}</td>
                                    {/each}
                                </tr>
                                <tr class="bg-gray-50 dark:bg-gray-900">
                                    <td class="px-4 py-2 font-medium">Revenue YoY%</td>
                                    <td class="px-4 py-2 text-center">-</td>
                                    {#each yoyRevenueChanges as change}
                                        <td class="px-4 py-2 text-center {change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                            {formatPercentage(change).formatted}
                                        </td>
                                    {/each}
                                </tr>
                                <tr class="bg-white dark:bg-gray-800">
                                    <td class="px-4 py-2 font-medium">Net Income</td>
                                    {#each annualStatements as stmt}
                                        <td class="px-4 py-2 text-center">{formatCurrency(stmt.net_income, 'abbreviated').formatted}</td>
                                    {/each}
                                </tr>
                                <tr class="bg-gray-50 dark:bg-gray-900">
                                    <td class="px-4 py-2 font-medium">Net Income YoY%</td>
                                    <td class="px-4 py-2 text-center">-</td>
                                    {#each yoyNetIncomeChanges as change}
                                        <td class="px-4 py-2 text-center {change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                            {formatPercentage(change).formatted}
                                        </td>
                                    {/each}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="relative mt-8">
                        <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-2 flex justify-between items-center">
                            Future Projections (Next 5 Years)
                        </h3>
                    </div>
                    
                    <!-- Future Projections Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs uppercase bg-gray-200 dark:bg-gray-700">
                                <tr>
                                    <th class="px-4 py-2 w-40">Metric</th>
                                    {#each futureYears as year}
                                        <th class="px-4 py-2 text-center">{year}</th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-gray-50 dark:bg-gray-900">
                                    <td class="px-4 py-2 font-medium">Revenue YoY%</td>
                                    {#each futureRevenueGrowth as growth, i}
                                        <td class="px-4 py-2 text-center">
                                            <input 
                                                type="text" 
                                                class="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1 py-0.5 text-center {growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}"
                                                bind:value={revenueInputValues[i]}
                                                on:input={(e) => handleRevenueInputChange(i, e)}
                                                on:blur={() => updateRevenueGrowth(i)}
                                                on:keydown={(e) => handleKeyDown(e, 'revenue', i)}
                                                on:focus={handleFocus}
                                            />
                                        </td>
                                    {/each}
                                </tr>
                                <tr class="bg-white dark:bg-gray-800">
                                    <td class="px-4 py-2 font-medium">Revenue</td>
                                    {#each futureRevenues as revenue}
                                        <td class="px-4 py-2 text-center">
                                            {formatCurrency(revenue, 'abbreviated').formatted}
                                        </td>
                                    {/each}
                                </tr>
                                <tr class="bg-gray-50 dark:bg-gray-900">
                                    <td class="px-4 py-2 font-medium">Net Income YoY%</td>
                                    {#each futureNetIncomeGrowth as growth, i}
                                        <td class="px-4 py-2 text-center">
                                            <input 
                                                type="text" 
                                                class="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1 py-0.5 text-center {growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}"
                                                bind:value={netIncomeInputValues[i]}
                                                on:input={(e) => handleNetIncomeInputChange(i, e)}
                                                on:blur={() => updateNetIncomeGrowth(i)}
                                                on:keydown={(e) => handleKeyDown(e, 'netIncome', i)}
                                                on:focus={handleFocus}
                                            />
                                        </td>
                                    {/each}
                                </tr>
                                <tr class="bg-white dark:bg-gray-800">
                                    <td class="px-4 py-2 font-medium">Net Income</td>
                                    {#each futureNetIncomes as netIncome}
                                        <td class="px-4 py-2 text-center">
                                            {formatCurrency(netIncome, 'abbreviated').formatted}
                                        </td>
                                    {/each}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="relative mt-8">
                        <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-2 flex justify-between items-center">
                            Valuation Summary
                        </h3>
                    </div>
                    
                    <!-- Valuation Summary -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Current P/E Ratio:</span>
                                <span class="text-gray-900 dark:text-gray-100">{stockMetadata?.pe_ratio?.toFixed(2) || 'N/A'}</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Future P/E Ratio:</span>
                                <div class="flex items-center">
                                    <input 
                                        type="number" 
                                        class="w-24 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1 py-0.5 text-right"
                                        bind:value={futurePERatio}
                                        on:focus={handleFocus}
                                    />
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Current Market Cap:</span>
                                <span class="text-gray-900 dark:text-gray-100" title={formatCurrency(stockMetadata?.market_cap, 'full').tooltip}>
                                    {formatCurrency(stockMetadata?.market_cap, 'abbreviated').formatted}
                                </span>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Future Net Income (Year 5):</span>
                                <span class="text-gray-900 dark:text-gray-100" title={formatCurrency(futureNetIncomes[4], 'full').tooltip}>
                                    {formatCurrency(futureNetIncomes[4], 'abbreviated').formatted}
                                </span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Future Market Cap:</span>
                                <span class="text-gray-900 dark:text-gray-100" title={formatCurrency(futureMarketCap, 'full').tooltip}>
                                    {formatCurrency(futureMarketCap, 'abbreviated').formatted}
                                </span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Potential Upside/Downside:</span>
                                <span class="text-gray-900 dark:text-gray-100 {upsideDownside >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-bold">
                                    {formatPercentage(upsideDownside).formatted}
                                </span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Implied 5Y CAGR:</span>
                                <span class="text-gray-900 dark:text-gray-100 {cagr >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-bold">
                                    {formatPercentage(cagr).formatted}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 text-sm text-gray-500 dark:text-gray-400 italic">
                        Note: This is a simplified valuation model. Actual future performance may vary significantly.
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
