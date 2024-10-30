<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';
    import { formatCurrency, formatPercentage, type NumberFormat } from '$lib/utils/numberFormat';

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
    let numberFormat: NumberFormat = 'abbreviated';
    let startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0];
    let endDate = new Date().toISOString().split('T')[0];
    let activeTab = 'income';

    async function loadFinancialData() {
        if (!$session) {
            const returnUrl = encodeURIComponent($page.url.pathname);
            goto(`/login?returnUrl=${returnUrl}`);
            return;
        }
        
        loading = true;
        error = null;

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                throw new Error('No active session');
            }

            const response = await fetch(`/api/financial-data/${symbol}`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.access_token}`
                }
            });
            
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid response format');
            }

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

    onMount(async () => {
        if ($session) {
            await loadFinancialData();
        }
    });

    $: if ($session) {
        loadFinancialData();
    }
</script>

<div class="flex flex-col h-full">
    <FinancialsHeader 
        {symbol}
        {loading}
        {numberFormat}
        {startDate}
        {endDate}
        on:refresh={loadFinancialData}
        on:formatChange={(e) => numberFormat = e.detail}
        on:dateChange={(e) => {
            if (e.detail.startDate) startDate = e.detail.startDate;
            if (e.detail.endDate) endDate = e.detail.endDate;
        }}
    />

    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="container mx-auto">
            <div class="flex space-x-4 p-4">
                <button 
                    class="px-4 py-2 rounded-lg transition-colors {activeTab === 'income' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
                    on:click={() => activeTab = 'income'}
                >
                    Income Statement
                </button>
                <button 
                    class="px-4 py-2 rounded-lg transition-colors {activeTab === 'balance' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
                    on:click={() => activeTab = 'balance'}
                >
                    Balance Sheet
                </button>
                <button 
                    class="px-4 py-2 rounded-lg transition-colors {activeTab === 'cashflow' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
                    on:click={() => activeTab = 'cashflow'}
                >
                    Cash Flow
                </button>
            </div>
        </div>
    </div>

    <div class="flex-1 overflow-hidden">
        {#if loading}
            <div class="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        {:else if error}
            <div class="p-4">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">{error}</span>
                </div>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <div class="p-4">
                    {#if activeTab === 'income' && financialData.income_statements.length > 0}
                        <table class="w-full whitespace-nowrap">
                            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th class="px-4 py-2 text-left">Date</th>
                                    <th class="px-4 py-2 text-right">Revenue</th>
                                    <th class="px-4 py-2 text-right">Net Income</th>
                                    <th class="px-4 py-2 text-right">EPS</th>
                                    <th class="px-4 py-2 text-right">Operating Income</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each financialData.income_statements as statement}
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td class="border-b px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.revenue, 'full').tooltip}>
                                            {formatCurrency(statement.revenue, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.net_income, 'full').tooltip}>
                                            {formatCurrency(statement.net_income, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right">{statement.eps?.toFixed(2) ?? 'N/A'}</td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.operating_income, 'full').tooltip}>
                                            {formatCurrency(statement.operating_income, numberFormat).formatted}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else if activeTab === 'balance' && financialData.balance_sheets.length > 0}
                        <table class="w-full whitespace-nowrap">
                            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th class="px-4 py-2 text-left">Date</th>
                                    <th class="px-4 py-2 text-right">Total Assets</th>
                                    <th class="px-4 py-2 text-right">Total Liabilities</th>
                                    <th class="px-4 py-2 text-right">Total Equity</th>
                                    <th class="px-4 py-2 text-right">Total Debt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each financialData.balance_sheets as statement}
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td class="border-b px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.total_assets, 'full').tooltip}>
                                            {formatCurrency(statement.total_assets, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.total_liabilities, 'full').tooltip}>
                                            {formatCurrency(statement.total_liabilities, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.total_equity, 'full').tooltip}>
                                            {formatCurrency(statement.total_equity, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.total_debt, 'full').tooltip}>
                                            {formatCurrency(statement.total_debt, numberFormat).formatted}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else if activeTab === 'cashflow' && financialData.cash_flow_statements.length > 0}
                        <table class="w-full whitespace-nowrap">
                            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th class="px-4 py-2 text-left">Date</th>
                                    <th class="px-4 py-2 text-right">Operating CF</th>
                                    <th class="px-4 py-2 text-right">Investing CF</th>
                                    <th class="px-4 py-2 text-right">Financing CF</th>
                                    <th class="px-4 py-2 text-right">Free Cash Flow</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each financialData.cash_flow_statements as statement}
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td class="border-b px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.operating_cash_flow, 'full').tooltip}>
                                            {formatCurrency(statement.operating_cash_flow, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.net_cash_used_for_investing_activities, 'full').tooltip}>
                                            {formatCurrency(statement.net_cash_used_for_investing_activities, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.net_cash_used_provided_by_financing_activities, 'full').tooltip}>
                                            {formatCurrency(statement.net_cash_used_provided_by_financing_activities, numberFormat).formatted}
                                        </td>
                                        <td class="border-b px-4 py-2 text-right" title={formatCurrency(statement.free_cash_flow, 'full').tooltip}>
                                            {formatCurrency(statement.free_cash_flow, numberFormat).formatted}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                            <strong class="font-bold">No Data Available!</strong>
                            <span class="block sm:inline">No financial data found for {symbol}</span>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
