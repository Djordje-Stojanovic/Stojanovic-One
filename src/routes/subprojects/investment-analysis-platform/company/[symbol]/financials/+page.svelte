<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import IncomeStatementTable from '$lib/components/financials/IncomeStatementTable.svelte';
    import BalanceSheetTable from '$lib/components/financials/BalanceSheetTable.svelte';
    import CashFlowTable from '$lib/components/financials/CashFlowTable.svelte';
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData } from '$lib/types/financialStatements';

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
    let companyName: string | null = null;


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

    async function fetchCompanyName() {
        try {
            const { data, error } = await supabase
                .from('stock_metadata')
                .select('company_name')
                .eq('symbol', symbol)
                .single();

            if (error) {
                throw error;
            }
            companyName = data?.company_name ?? null;
        } catch (e) {
            console.error('Error fetching company name:', e);
            companyName = null; // Handle error appropriately
        }
    }

    onMount(async () => {
        if ($session) {
            await loadFinancialData();
            await fetchCompanyName();
        }
    });

    $: if ($session) {
        loadFinancialData();
        fetchCompanyName();
    }
</script>

<div class="min-h-screen bg-white dark:bg-gray-800 p-4">
    <button class="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={() => goto('/subprojects/investment-analysis-platform')}>
        Back to Stocks
    </button>
    <FinancialsHeader
        {symbol}
        {companyName}
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

    <div class="mt-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <div class="flex space-x-4">
            <button class={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'income' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                on:click={() => activeTab = 'income'}
            >
                Income Statement
            </button>
            <button class={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'balance' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                on:click={() => activeTab = 'balance'}
            >
                Balance Sheet
            </button>
            <button class={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'cashflow' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                on:click={() => activeTab = 'cashflow'}
            >
                Cash Flow
            </button>
        </div>
    </div>

    <div class="mt-4 overflow-hidden rounded-lg shadow-sm">
        {#if loading}
            <div class="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        {:else if error}
            <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline">{error}</span>
            </div>
        {:else}
            <div class="overflow-x-auto p-4">
                {#if activeTab === 'income' && financialData.income_statements.length > 0}
                    <IncomeStatementTable statements={financialData.income_statements} {numberFormat} />
                {:else if activeTab === 'balance' && financialData.balance_sheets.length > 0}
                    <BalanceSheetTable statements={financialData.balance_sheets} {numberFormat} />
                {:else if activeTab === 'cashflow' && financialData.cash_flow_statements.length > 0}
                    <CashFlowTable statements={financialData.cash_flow_statements} {numberFormat} />
                {:else}
                    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">No Data Available!</strong>
                        <span class="block sm:inline">No financial data found for {symbol}</span>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
