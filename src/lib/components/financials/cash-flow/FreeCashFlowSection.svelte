<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import type { FinancialSectionProps } from '../types';
    import MetricRow from '../base/MetricRow.svelte';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat;
    export let selectedMetricNames: string[] = [];

    const dispatch = createEventDispatcher();

    function handleMetricClick(event: CustomEvent) {
        dispatch('metricClick', event.detail);
    }

    // Sort statements by date (oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    $: dates = sortedStatements.map(s => s.date);
</script>

<SectionStyles />

<tr class="section-header">
    <td class="metric-name">Free Cash Flow</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Operating Cash Flow"
    values={sortedStatements.map(s => s.operating_cash_flow)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Operating Cash Flow")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Capital Expenditure"
    values={sortedStatements.map(s => s.capital_expenditure)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Capital Expenditure")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Free Cash Flow"
    values={sortedStatements.map(s => s.free_cash_flow)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Free Cash Flow")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Net Change in Cash"
    values={sortedStatements.map(s => s.net_change_in_cash)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Net Change in Cash")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Cash at End of Period"
    values={sortedStatements.map(s => s.cash_at_end_of_period)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Cash at End of Period")}
    on:metricClick={handleMetricClick}
/>
