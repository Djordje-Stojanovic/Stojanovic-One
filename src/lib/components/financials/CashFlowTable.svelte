<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialTableProps } from './types';
    import BaseFinancialTable from './base/BaseFinancialTable.svelte';
    import OperatingSection from './cash-flow/OperatingSection.svelte';
    import InvestingSection from './cash-flow/InvestingSection.svelte';
    import FinancingSection from './cash-flow/FinancingSection.svelte';
    import FreeCashFlowSection from './cash-flow/FreeCashFlowSection.svelte';

    type Props = FinancialTableProps<CashFlowStatement>;
    
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

<BaseFinancialTable {statements} tableName="Cash Flow Statement">
    <tbody>
        <OperatingSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <InvestingSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <FinancingSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <FreeCashFlowSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
    </tbody>
</BaseFinancialTable>
