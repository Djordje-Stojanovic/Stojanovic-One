<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import IncomeStatementTable from './IncomeStatementTable.svelte';
    import BalanceSheetTable from './BalanceSheetTable.svelte';
    import CashFlowTable from './CashFlowTable.svelte';
    import RevenueSegmentsTable from './revenue-segments/RevenueSegmentsTable.svelte';

    export let loading = false;
    export let error: string | null = null;
    export let financialData: FinancialData;
    export let numberFormat: NumberFormat;
    export let activeTab: 'income' | 'balance' | 'cashflow' | 'segments' = 'income';
    export let selectedMetricNames: string[] = [];

    const dispatch = createEventDispatcher();

    function handleMetricClick(event: CustomEvent) {
        dispatch('metricClick', event.detail);
    }

    function scrollToRight() {
        const tables = document.querySelectorAll('.financial-table-container');
        tables.forEach(table => {
            if (table instanceof HTMLElement) {
                table.scrollLeft = table.scrollWidth;
            }
        });
    }
</script>

<div class="space-y-4">
    <div class="flex space-x-2 mb-4">
        <button
            class="px-4 py-2 rounded-lg transition-colors {activeTab === 'income' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
            on:click={() => activeTab = 'income'}
        >
            Income Statement
        </button>
        <button
            class="px-4 py-2 rounded-lg transition-colors {activeTab === 'balance' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
            on:click={() => activeTab = 'balance'}
        >
            Balance Sheet
        </button>
        <button
            class="px-4 py-2 rounded-lg transition-colors {activeTab === 'cashflow' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
            on:click={() => activeTab = 'cashflow'}
        >
            Cash Flow
        </button>
        <button
            class="px-4 py-2 rounded-lg transition-colors {activeTab === 'segments' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
            on:click={() => activeTab = 'segments'}
        >
            Revenue Segments
        </button>
    </div>

    {#if loading}
        <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if error}
        <div class="text-red-500 dark:text-red-400 p-4 rounded-lg bg-red-100 dark:bg-red-900/20">
            {error}
        </div>
    {:else}
        <div class="overflow-x-auto financial-table-container">
            {#if activeTab === 'income'}
                <IncomeStatementTable
                    statements={financialData.income_statements}
                    {numberFormat}
                    {selectedMetricNames}
                    on:metricClick={handleMetricClick}
                />
            {:else if activeTab === 'balance'}
                <BalanceSheetTable
                    statements={financialData.balance_sheets}
                    {numberFormat}
                    {selectedMetricNames}
                    on:metricClick={handleMetricClick}
                />
            {:else if activeTab === 'cashflow'}
                <CashFlowTable
                    statements={financialData.cash_flow_statements}
                    {numberFormat}
                    {selectedMetricNames}
                    on:metricClick={handleMetricClick}
                />
            {:else if activeTab === 'segments' && financialData.revenue_segments?.length}
                <RevenueSegmentsTable
                    data={financialData.revenue_segments}
                    {numberFormat}
                    {selectedMetricNames}
                    on:metricClick={handleMetricClick}
                />
            {/if}
        </div>
    {/if}
</div>
