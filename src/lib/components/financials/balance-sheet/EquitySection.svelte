<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: BalanceSheet[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Shareholders' Equity Section -->
<tr class="section-header">
    <td class="metric-name">Shareholders' Equity</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Common Stock</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.common_stock || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Retained Earnings</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.retained_earnings || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Total Equity</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.total_equity || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>
