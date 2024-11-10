<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Financing Activities -->
<tr class="section-header">
    <td class="metric-name">Financing Activities</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Debt Repayment</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.debt_repayment, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Share Repurchases</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.common_stock_repurchased, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Dividends Paid</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.dividends_paid, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Net Financing Cash Flow</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.net_cash_used_provided_by_financing_activities, numberFormat).formatted}
        </td>
    {/each}
</tr>
