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
    <td class="metric-name">Assets</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<!-- Current Assets -->
<MetricRow
    name="Cash & Cash Equivalents"
    values={sortedStatements.map(s => s.cash_and_cash_equivalents)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Cash & Cash Equivalents")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Short Term Investments"
    values={sortedStatements.map(s => s.short_term_investments)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Short Term Investments")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Net Receivables"
    values={sortedStatements.map(s => s.net_receivables)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Net Receivables")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Inventory"
    values={sortedStatements.map(s => s.inventory)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Inventory")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Current Assets"
    values={sortedStatements.map(s => s.total_current_assets)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Current Assets")}
    on:metricClick={handleMetricClick}
/>

<!-- Non-Current Assets -->
<MetricRow
    name="Property, Plant & Equipment"
    values={sortedStatements.map(s => s.property_plant_equipment_net)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Property, Plant & Equipment")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Goodwill"
    values={sortedStatements.map(s => s.goodwill)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Goodwill")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Intangible Assets"
    values={sortedStatements.map(s => s.intangible_assets)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Intangible Assets")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Long Term Investments"
    values={sortedStatements.map(s => s.long_term_investments)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Long Term Investments")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Non-Current Assets"
    values={sortedStatements.map(s => s.total_non_current_assets)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Non-Current Assets")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Assets"
    values={sortedStatements.map(s => s.total_assets)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Assets")}
    on:metricClick={handleMetricClick}
/>
