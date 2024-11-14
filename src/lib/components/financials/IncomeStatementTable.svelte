<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialTableProps } from './types';
    import BaseFinancialTable from './base/BaseFinancialTable.svelte';
    import RevenueSection from './income-statement/RevenueSection.svelte';
    import OperatingExpensesSection from './income-statement/OperatingExpensesSection.svelte';
    import OtherIncomeSection from './income-statement/OtherIncomeSection.svelte';
    import PerShareSection from './income-statement/PerShareSection.svelte';

    type Props = FinancialTableProps<IncomeStatement>;
    
    export let statements: Props['statements'] = [];
    export let numberFormat: Props['numberFormat'] = 'abbreviated';
    export let selectedMetricNames: Props['selectedMetricNames'] = [];

    const dispatch = createEventDispatcher();

    function handleMetricClick(event: CustomEvent) {
        dispatch('metricClick', event.detail);
    }

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
</script>

<BaseFinancialTable {statements} tableName="Income Statement">
    <tbody>
        <RevenueSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <OperatingExpensesSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <OtherIncomeSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <PerShareSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
    </tbody>
</BaseFinancialTable>
