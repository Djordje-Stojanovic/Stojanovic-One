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
    <td class="metric-name">Per Share Data</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="EPS"
    values={sortedStatements.map(s => s.eps)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("EPS")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="EPS Diluted"
    values={sortedStatements.map(s => s.eps_diluted)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("EPS Diluted")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Weighted Average Shares"
    values={sortedStatements.map(s => s.weighted_average_shs_out)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Weighted Average Shares")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Weighted Average Shares Diluted"
    values={sortedStatements.map(s => s.weighted_average_shs_out_dil)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Weighted Average Shares Diluted")}
    on:metricClick={handleMetricClick}
/>
