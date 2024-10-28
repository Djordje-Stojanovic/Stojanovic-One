<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';

    interface FinancialStatement {
        symbol: string;
        date: string;
        reportedCurrency: string;
        cik: string;
        fillingDate: string;
        acceptedDate: string;
        calendarYear: string;
        period: string;
    }

    interface IncomeStatement extends FinancialStatement {
        revenue: number;
        netIncome: number;
        eps: number;
        operatingIncome: number;
        grossProfit: number;
        ebitda: number;
    }

    interface BalanceSheet extends FinancialStatement {
        totalAssets: number;
        totalLiabilities: number;
        totalStockholdersEquity: number;
        cashAndCashEquivalents: number;
        totalInvestments: number;
        totalDebt: number;
    }

    interface CashFlowStatement extends FinancialStatement {
        operatingCashFlow: number;
        netCashUsedForInvestingActivities: number;
        netCashUsedProvidedByFinancingActivities: number;
        freeCashFlow: number;
        capitalExpenditure: number;
    }

    interface FinancialData {
        income_statements: IncomeStatement[];
        balance_sheets: BalanceSheet[];
        cash_flow_statements: CashFlowStatement[];
    }

    const symbol = $page.params.symbol;
    let financialData: FinancialData = {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    };
    let loading = false;
    let error: string | null = null;

    async function loadFinancialData() {
        if (!$session) {
            const returnUrl = encodeURIComponent($page.url.pathname);
            goto(`/login?returnUrl=${returnUrl}`);
            return;
        }
        
        loading = true;
        error = null;

        try {
            const response = await fetch(`/api/financial-data/${symbol}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch financial data');
            }

            financialData = result.data;
        } catch (e) {
            error = e instanceof Error ? e.message : 'An error occurred while fetching data';
            console.error('Error loading financial data:', e);
        } finally {
            loading = false;
        }
    }

    function formatCurrency(value: number | null | undefined): string {
        if (value == null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    onMount(() => {
        if ($session) {
            loadFinancialData();
        }
    });

    $: if ($session) {
        loadFinancialData();
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Financial Statements - {symbol}</h1>
        <button
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            on:click={loadFinancialData}
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Refresh Data'}
        </button>
    </div>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <LoadingSpinner />
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline">{error}</span>
        </div>
    {:else if financialData.income_statements.length === 0}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">No Data Available!</strong>
            <span class="block sm:inline">No financial data found for {symbol}</span>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <h2 class="text-2xl font-bold mb-4">Income Statements</h2>
            <table class="w-full table-auto mb-8">
                <thead>
                    <tr>
                        <th class="px-4 py-2">Date</th>
                        <th class="px-4 py-2">Revenue</th>
                        <th class="px-4 py-2">Net Income</th>
                        <th class="px-4 py-2">EPS</th>
                        <th class="px-4 py-2">Operating Income</th>
                    </tr>
                </thead>
                <tbody>
                    {#each financialData.income_statements as statement}
                        <tr>
                            <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.revenue)}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.netIncome)}</td>
                            <td class="border px-4 py-2">{statement.eps?.toFixed(2) ?? 'N/A'}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.operatingIncome)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <h2 class="text-2xl font-bold mb-4">Balance Sheets</h2>
            <table class="w-full table-auto mb-8">
                <thead>
                    <tr>
                        <th class="px-4 py-2">Date</th>
                        <th class="px-4 py-2">Total Assets</th>
                        <th class="px-4 py-2">Total Liabilities</th>
                        <th class="px-4 py-2">Total Equity</th>
                    </tr>
                </thead>
                <tbody>
                    {#each financialData.balance_sheets as statement}
                        <tr>
                            <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.totalAssets)}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.totalLiabilities)}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.totalStockholdersEquity)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <h2 class="text-2xl font-bold mb-4">Cash Flow Statements</h2>
            <table class="w-full table-auto">
                <thead>
                    <tr>
                        <th class="px-4 py-2">Date</th>
                        <th class="px-4 py-2">Operating CF</th>
                        <th class="px-4 py-2">Investing CF</th>
                        <th class="px-4 py-2">Financing CF</th>
                    </tr>
                </thead>
                <tbody>
                    {#each financialData.cash_flow_statements as statement}
                        <tr>
                            <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.operatingCashFlow)}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.netCashUsedForInvestingActivities)}</td>
                            <td class="border px-4 py-2">{formatCurrency(statement.netCashUsedProvidedByFinancingActivities)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
