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
    let tableContainer: HTMLDivElement;

    function scrollToRight() {
        if (tableContainer) {
            tableContainer.scrollLeft = tableContainer.scrollWidth;
        }
    }

    async function loadFinancialData(forceRefresh = false) {
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

            const url = new URL(`/api/financial-data/${symbol}`, window.location.origin);
            if (forceRefresh) {
                url.searchParams.set('forceRefresh', 'true');
            }

            const response = await fetch(url.toString(), {
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
            // Scroll after data loads
            setTimeout(scrollToRight, 100);
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
            companyName = null;
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

    // Scroll to right when switching tabs
    $: if (activeTab) {
        setTimeout(scrollToRight, 100);
    }
</script>

<div class="min-h-screen bg-white dark:bg-[#1F2937] p-4 space-y-4">
    <button 
        class="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium px-4 py-2 rounded-[0.375rem] shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
        on:click={() => goto('/subprojects/investment-analysis-platform')}
    >
        Back to Stocks
    </button>

    <FinancialsHeader
        {symbol}
        {companyName}
        {loading}
        {numberFormat}
        {startDate}
        {endDate}
        on:refresh={() => loadFinancialData(true)}
        on:formatChange={(e) => numberFormat = e.detail}
        on:dateChange={(e) => {
            if (e.detail.startDate) startDate = e.detail.startDate;
            if (e.detail.endDate) endDate = e.detail.endDate;
        }}
    />

    <div class="bg-white dark:bg-[#374151] rounded-[0.375rem] shadow-sm transition-all duration-300">
        <div class="flex space-x-1 p-2">
            <button
                class={`px-4 py-2 rounded-[0.375rem] font-medium transition-all duration-300 ${
                    activeTab === 'income'
                        ? 'bg-[#3B82F6] text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F2937]'
                }`}
                on:click={() => activeTab = 'income'}
            >
                Income Statement
            </button>
            <button
                class={`px-4 py-2 rounded-[0.375rem] font-medium transition-all duration-300 ${
                    activeTab === 'balance'
                        ? 'bg-[#3B82F6] text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F2937]'
                }`}
                on:click={() => activeTab = 'balance'}
            >
                Balance Sheet
            </button>
            <button
                class={`px-4 py-2 rounded-[0.375rem] font-medium transition-all duration-300 ${
                    activeTab === 'cashflow'
                        ? 'bg-[#3B82F6] text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F2937]'
                }`}
                on:click={() => activeTab = 'cashflow'}
            >
                Cash Flow
            </button>
        </div>
    </div>

    <div class="bg-white dark:bg-[#374151] rounded-[0.375rem] shadow-sm overflow-hidden transition-all duration-300">
        {#if loading}
            <div class="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        {:else if error}
            <div class="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-[0.375rem] relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline ml-2">{error}</span>
            </div>
        {:else}
            <div class="overflow-x-auto" bind:this={tableContainer}>
                {#if activeTab === 'income' && financialData.income_statements.length > 0}
                    <IncomeStatementTable statements={financialData.income_statements} {numberFormat} />
                {:else if activeTab === 'balance' && financialData.balance_sheets.length > 0}
                    <BalanceSheetTable statements={financialData.balance_sheets} {numberFormat} />
                {:else if activeTab === 'cashflow' && financialData.cash_flow_statements.length > 0}
                    <CashFlowTable statements={financialData.cash_flow_statements} {numberFormat} />
                {:else}
                    <div class="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-[0.375rem] m-4" role="alert">
                        <strong class="font-bold">No Data Available!</strong>
                        <span class="block sm:inline ml-2">No financial data found for {symbol}</span>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
