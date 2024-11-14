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
    <td class="metric-name">Other Income & Expenses</td>
    {#each sortedStatements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<MetricRow
    name="Interest Income"
    values={sortedStatements.map(s => s.interest_income)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Interest Income")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Interest Expense"
    values={sortedStatements.map(s => s.interest_expense)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Interest Expense")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Total Other Income/Expenses"
    values={sortedStatements.map(s => s.total_other_income_expenses_net)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Total Other Income/Expenses")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Income Before Tax"
    values={sortedStatements.map(s => s.income_before_tax)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Income Before Tax")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Income Tax Expense"
    values={sortedStatements.map(s => s.income_tax_expense)}
    dates={dates}
    {numberFormat}
    isSelected={selectedMetricNames.includes("Income Tax Expense")}
    on:metricClick={handleMetricClick}
/>

<MetricRow
    name="Net Income"
    values={sortedStatements.map(s => s.net_income)}
    dates={dates}
    {numberFormat}
    isTotal={true}
    isSelected={selectedMetricNames.includes("Net Income")}
    on:metricClick={handleMetricClick}
/>
