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
    <td class="metric-name">Liabilities</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<!-- Current Liabilities -->
<MetricRow
    name="Account Payables"
    values={sortedStatements.map(s => s.account_payables)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Account Payables")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Short Term Debt"
    values={sortedStatements.map(s => s.short_term_debt)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Short Term Debt")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Deferred Revenue"
    values={sortedStatements.map(s => s.deferred_revenue)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Deferred Revenue")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Current Liabilities"
    values={sortedStatements.map(s => s.total_current_liabilities)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Current Liabilities")}
    on:metricClick={handleMetricClick}
/>

<!-- Non-Current Liabilities -->
<MetricRow
    name="Long Term Debt"
    values={sortedStatements.map(s => s.long_term_debt)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Long Term Debt")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Deferred Revenue Non-Current"
    values={sortedStatements.map(s => s.deferred_revenue_non_current)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Deferred Revenue Non-Current")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Non-Current Liabilities"
    values={sortedStatements.map(s => s.total_non_current_liabilities)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Non-Current Liabilities")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Liabilities"
    values={sortedStatements.map(s => s.total_liabilities)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Liabilities")}
    on:metricClick={handleMetricClick}
/>
