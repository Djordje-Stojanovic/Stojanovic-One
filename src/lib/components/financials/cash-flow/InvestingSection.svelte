<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Investing Activities -->
<tr class="section-header">
    <td class="metric-name">Investing Activities</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Capital Expenditure</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.capital_expenditure, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Acquisitions</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.acquisitions_net, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Net Investing Cash Flow</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.net_cash_used_for_investing_activities, numberFormat).formatted}
        </td>
    {/each}
</tr>
