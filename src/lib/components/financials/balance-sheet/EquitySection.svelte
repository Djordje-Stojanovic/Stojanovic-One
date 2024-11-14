<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import type { FinancialSectionProps } from '../types';
    import MetricRow from '../base/MetricRow.svelte';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: BalanceSheet[] = [];
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
    <td class="metric-name">Stockholders' Equity</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Common Stock"
    values={sortedStatements.map(s => s.common_stock)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Common Stock")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Retained Earnings"
    values={sortedStatements.map(s => s.retained_earnings)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Retained Earnings")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Accumulated Other Comprehensive Income/Loss"
    values={sortedStatements.map(s => s.accumulated_other_comprehensive_income_loss)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Accumulated Other Comprehensive Income/Loss")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Stockholders' Equity"
    values={sortedStatements.map(s => s.total_stockholders_equity)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Stockholders' Equity")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Liabilities and Equity"
    values={sortedStatements.map(s => s.total_liabilities_and_stockholders_equity)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Liabilities and Equity")}
    on:metricClick={handleMetricClick}
/>
