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
    <td class="metric-name">Financing Activities</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Debt Repayment"
    values={sortedStatements.map(s => s.debt_repayment)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Debt Repayment")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Common Stock Issued"
    values={sortedStatements.map(s => s.common_stock_issued)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Common Stock Issued")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Common Stock Repurchased"
    values={sortedStatements.map(s => s.common_stock_repurchased)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Common Stock Repurchased")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Dividends Paid"
    values={sortedStatements.map(s => s.dividends_paid)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Dividends Paid")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Net Financing Cash Flow"
    values={sortedStatements.map(s => s.net_cash_used_provided_by_financing_activities)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Net Financing Cash Flow")}
    on:metricClick={handleMetricClick}
/>
