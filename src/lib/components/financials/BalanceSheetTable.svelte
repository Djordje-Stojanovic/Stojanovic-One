<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialTableProps } from './types';
    import BaseFinancialTable from './base/BaseFinancialTable.svelte';
    import AssetsSection from './balance-sheet/AssetsSection.svelte';
    import LiabilitiesSection from './balance-sheet/LiabilitiesSection.svelte';
    import EquitySection from './balance-sheet/EquitySection.svelte';

    type Props = FinancialTableProps<BalanceSheet>;
    
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

<BaseFinancialTable {statements} tableName="Balance Sheet">
    <tbody>
        <AssetsSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <LiabilitiesSection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
        <EquitySection 
            statements={sortedStatements} 
            {numberFormat}
            {selectedMetricNames}
            on:metricClick={handleMetricClick}
        />
    </tbody>
</BaseFinancialTable>
