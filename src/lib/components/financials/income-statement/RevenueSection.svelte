<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import type { FinancialSectionProps } from '../types';
    import MetricRow from '../base/MetricRow.svelte';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: IncomeStatement[] = [];
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
    <td class="metric-name">Revenue & Gross Profit</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Revenue"
    values={sortedStatements.map(s => s.revenue)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Revenue")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Cost of Revenue"
    values={sortedStatements.map(s => s.cost_of_revenue)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Cost of Revenue")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Gross Profit"
    values={sortedStatements.map(s => s.gross_profit)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Gross Profit")}
    on:metricClick={handleMetricClick}
/>
