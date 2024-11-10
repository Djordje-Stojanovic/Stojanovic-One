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
    <td class="metric-name">Operating Expenses</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Research & Development</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.research_and_development_expenses, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">SG&A Expenses</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.selling_general_and_administrative_expenses, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Operating Income</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.operating_income, numberFormat).formatted}
        </td>
    {/each}
</tr>
