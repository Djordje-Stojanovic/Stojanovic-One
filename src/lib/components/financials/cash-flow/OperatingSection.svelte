<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Operating Activities -->
<tr class="section-header">
    <td class="metric-name">Operating Activities</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Net Income</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.net_income, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Depreciation & Amortization</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.depreciation_and_amortization, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Stock Based Compensation</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.stock_based_compensation, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Change in Working Capital</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.change_in_working_capital, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Operating Cash Flow</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.net_cash_provided_by_operating_activities, numberFormat).formatted}
        </td>
    {/each}
</tr>
