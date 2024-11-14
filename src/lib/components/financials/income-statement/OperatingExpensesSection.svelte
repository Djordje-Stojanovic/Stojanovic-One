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
    <td class="metric-name">Operating Expenses</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Research & Development"
    values={sortedStatements.map(s => s.research_and_development_expenses)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Research & Development")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Sales, General & Administrative"
    values={sortedStatements.map(s => s.selling_general_and_administrative_expenses)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Sales, General & Administrative")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Operating Expenses"
    values={sortedStatements.map(s => s.operating_expenses)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Operating Expenses")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Operating Income"
    values={sortedStatements.map(s => s.operating_income)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Operating Income")}
    on:metricClick={handleMetricClick}
/>
