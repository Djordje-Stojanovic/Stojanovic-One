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
    <td class="metric-name">Operating Activities</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Net Income"
    values={sortedStatements.map(s => s.net_income)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Net Income")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Depreciation & Amortization"
    values={sortedStatements.map(s => s.depreciation_and_amortization)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Depreciation & Amortization")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Stock Based Compensation"
    values={sortedStatements.map(s => s.stock_based_compensation)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Stock Based Compensation")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Change in Working Capital"
    values={sortedStatements.map(s => s.change_in_working_capital)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Change in Working Capital")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Operating Cash Flow"
    values={sortedStatements.map(s => s.operating_cash_flow)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Operating Cash Flow")}
    on:metricClick={handleMetricClick}
/>
