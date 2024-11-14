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
    <td class="metric-name">Investing Activities</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Capital Expenditure"
    values={sortedStatements.map(s => s.capital_expenditure)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Capital Expenditure")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Acquisitions"
    values={sortedStatements.map(s => s.acquisitions_net)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Acquisitions")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Purchase of Investments"
    values={sortedStatements.map(s => s.purchases_of_investments)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Purchase of Investments")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Sale of Investments"
    values={sortedStatements.map(s => s.sales_maturities_of_investments)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Sale of Investments")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Net Investing Cash Flow"
    values={sortedStatements.map(s => s.net_cash_used_for_investing_activities)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Net Investing Cash Flow")}
    on:metricClick={handleMetricClick}
/>
