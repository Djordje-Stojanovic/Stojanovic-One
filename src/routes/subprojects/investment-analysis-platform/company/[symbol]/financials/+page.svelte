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
        reported_currency: string;
        cik: string;
        filling_date: string;
        accepted_date: string;
        calendar_year: string;
        period: string;
    }

    interface IncomeStatement {
        symbol: string;
        date: string;
        revenue: number;
        net_income: number;
        eps: number;
        operating_income: number;
    }

    interface BalanceSheet extends FinancialStatement {
        cash_and_cash_equivalents: number;
        short_term_investments: number;
        cash_and_short_term_investments: number;
        net_receivables: number;
        inventory: number;
        total_current_assets: number;
        property_plant_equipment_net: number;
        total_non_current_assets: number;
        total_assets: number;
        total_current_liabilities: number;
        total_non_current_liabilities: number;
        total_liabilities: number;
        total_stockholders_equity: number;
        total_equity: number;
        total_investments: number;
        total_debt: number;
    }

    interface CashFlowStatement extends FinancialStatement {
        net_income: number;
        operating_cash_flow: number;
        net_cash_used_for_investing_activities: number;
        net_cash_used_provided_by_financing_activities: number;
        free_cash_flow: number;
        capital_expenditure: number;
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
            console.log('Loading financial data for symbol:', symbol);
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                throw new Error('No active session');
            }

            const response = await fetch(`/api/financial-data/${symbol}`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.access_token}`
                }
            });
            
            console.log('API Response status:', response.status);
            const responseText = await response.text();
            console.log('API Response text:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error('Invalid response format');
            }

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch financial data');
            }

            console.log('Received financial data:', result.data);
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

    onMount(async () => {
        if ($session) {
            await loadFinancialData();
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
    {:else}
        {#if financialData.income_statements.length === 0 && financialData.balance_sheets.length === 0 && financialData.cash_flow_statements.length === 0}
            <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">No Data Available!</strong>
                <span class="block sm:inline">No financial data found for {symbol}</span>
            </div>
        {:else}
            <div class="overflow-x-auto space-y-8">
                {#if financialData.income_statements.length > 0}
                    <div>
                        <h2 class="text-2xl font-bold mb-4">Income Statements</h2>
                        <table class="w-full table-auto">
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
                                        <td class="border px-4 py-2">{formatCurrency(statement.net_income)}</td>
                                        <td class="border px-4 py-2">{statement.eps?.toFixed(2) ?? 'N/A'}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.operating_income)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}

                {#if financialData.balance_sheets.length > 0}
                    <div>
                        <h2 class="text-2xl font-bold mb-4">Balance Sheets</h2>
                        <table class="w-full table-auto">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2">Date</th>
                                    <th class="px-4 py-2">Total Assets</th>
                                    <th class="px-4 py-2">Total Liabilities</th>
                                    <th class="px-4 py-2">Total Equity</th>
                                    <th class="px-4 py-2">Total Debt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each financialData.balance_sheets as statement}
                                    <tr>
                                        <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.total_assets)}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.total_liabilities)}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.total_equity)}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.total_debt)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}

                {#if financialData.cash_flow_statements.length > 0}
                    <div>
                        <h2 class="text-2xl font-bold mb-4">Cash Flow Statements</h2>
                        <table class="w-full table-auto">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2">Date</th>
                                    <th class="px-4 py-2">Operating CF</th>
                                    <th class="px-4 py-2">Investing CF</th>
                                    <th class="px-4 py-2">Financing CF</th>
                                    <th class="px-4 py-2">Free Cash Flow</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each financialData.cash_flow_statements as statement}
                                    <tr>
                                        <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.operating_cash_flow)}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.net_cash_used_for_investing_activities)}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.net_cash_used_provided_by_financing_activities)}</td>
                                        <td class="border px-4 py-2">{formatCurrency(statement.free_cash_flow)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>
