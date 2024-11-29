<script lang="ts">
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import IncomeStatementTable from './IncomeStatementTable.svelte';
    import BalanceSheetTable from './BalanceSheetTable.svelte';
    import CashFlowTable from './CashFlowTable.svelte';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let loading: boolean;
    export let error: string | null;
    export let activeTab: 'income' | 'balance' | 'cashflow';
    export let financialData: FinancialData;
    export let numberFormat: NumberFormat;
    export let symbol: string;

    let tableContainer: HTMLDivElement;

    export function scrollToRight() {
        if (tableContainer) {
            tableContainer.scrollLeft = tableContainer.scrollWidth;
        }
    }
</script>

<!-- Tabs -->
<div class="bg-white dark:bg-[#374151] rounded-[0.375rem] shadow-sm transition-all duration-300">
    <div class="flex justify-center space-x-1 p-2">
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

<!-- Content -->
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
