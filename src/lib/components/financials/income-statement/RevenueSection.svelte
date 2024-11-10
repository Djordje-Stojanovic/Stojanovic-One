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
    <td class="metric-name">Revenue & Gross Profit</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Revenue</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.revenue, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Cost of Revenue</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.cost_of_revenue, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Gross Profit</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.gross_profit, numberFormat).formatted}
        </td>
    {/each}
</tr>
