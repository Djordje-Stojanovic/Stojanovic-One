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
    <td class="metric-name">Per Share Data</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Basic EPS</td>
    {#each statements as statement}
        <td class="value-cell">
            {statement.eps?.toFixed(2)}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Diluted EPS</td>
    {#each statements as statement}
        <td class="value-cell">
            {statement.eps_diluted?.toFixed(2)}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Shares Outstanding (Basic)</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.weighted_average_shs_out, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Shares Outstanding (Diluted)</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.weighted_average_shs_out_dil, numberFormat).formatted}
        </td>
    {/each}
</tr>
