<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: IncomeStatement[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<tr class="section-header">
    <td class="metric-name">Other Income/Expenses</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Interest Income</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.interest_income, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Interest Expense</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.interest_expense, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Income Before Tax</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.income_before_tax, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Income Tax Expense</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.income_tax_expense, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Net Income</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.net_income, numberFormat).formatted}
        </td>
    {/each}
</tr>
