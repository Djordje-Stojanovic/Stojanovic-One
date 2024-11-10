<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: BalanceSheet[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Liabilities Section -->
<tr class="section-header">
    <td class="metric-name">Liabilities</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<!-- Current Liabilities -->
<tr class="subsection-header">
    <td class="metric-name">Current Liabilities</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Accounts Payable</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.account_payables || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Short Term Debt</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.short_term_debt || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Total Current Liabilities</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.total_current_liabilities || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<!-- Non-Current Liabilities -->
<tr class="subsection-header">
    <td class="metric-name">Non-Current Liabilities</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Long Term Debt</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.long_term_debt || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Total Liabilities</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.total_liabilities || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>
