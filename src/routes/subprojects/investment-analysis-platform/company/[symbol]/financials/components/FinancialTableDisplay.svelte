<script lang="ts">
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import FinancialStatementTables from '$lib/components/financials/FinancialStatementTables.svelte';

    export let loading = false;
    export let error: string | null = null;
    export let financialData: FinancialData;
    export let numberFormat: NumberFormat;
    export let activeTab: 'income' | 'balance' | 'cashflow' | 'segments' | 'geo_segments';
    export let selectedMetricNames: string[];

    let tablesComponent: FinancialStatementTables;

    // Computed property to check if we have data for the current tab
    $: hasData = (() => {
        switch (activeTab) {
            case 'income':
                return financialData.income_statements.length > 0;
            case 'balance':
                return financialData.balance_sheets.length > 0;
            case 'cashflow':
                return financialData.cash_flow_statements.length > 0;
            case 'segments':
                return (financialData.revenue_segments || []).length > 0;
            case 'geo_segments':
                return (financialData.revenue_geo_segments || []).length > 0;
            default:
                return false;
        }
    })();
</script>

{#if !hasData && !loading && !error}
    <div class="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-lg" role="alert">
        <strong class="font-bold">No Data Available!</strong>
        <span class="block sm:inline ml-2">No financial data found for this section</span>
    </div>
{/if}

<FinancialStatementTables
    bind:this={tablesComponent}
    bind:activeTab
    {loading}
    {error}
    {financialData}
    {numberFormat}
    {selectedMetricNames}
    on:metricClick
/>
