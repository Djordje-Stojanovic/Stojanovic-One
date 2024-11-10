<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Free Cash Flow -->
<tr class="section-header">
    <td class="metric-name">Free Cash Flow</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Free Cash Flow</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.free_cash_flow, numberFormat).formatted}
        </td>
    {/each}
</tr>
