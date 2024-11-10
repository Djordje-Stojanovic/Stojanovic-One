<script lang="ts">
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import SectionStyles from '../styles/SectionStyles.svelte';

    export let statements: BalanceSheet[] = [];
    export let numberFormat: NumberFormat;
</script>

<SectionStyles />

<!-- Assets Section -->
<tr class="section-header">
    <td class="metric-name">Assets</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<!-- Current Assets -->
<tr class="subsection-header">
    <td class="metric-name">Current Assets</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Cash & Cash Equivalents</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.cash_and_cash_equivalents || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Short Term Investments</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.short_term_investments || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Net Receivables</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.net_receivables || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Inventory</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.inventory || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Total Current Assets</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.total_current_assets || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<!-- Non-Current Assets -->
<tr class="subsection-header">
    <td class="metric-name">Non-Current Assets</td>
    {#each statements as statement}
        <td class="value-cell"></td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Property, Plant & Equipment</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.property_plant_equipment_net || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr>
    <td class="metric-name metric-row">Long Term Investments</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.long_term_investments || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>

<tr class="total-row">
    <td class="metric-name">Total Assets</td>
    {#each statements as statement}
        <td class="value-cell">
            {formatNumber(statement.total_assets || 0, numberFormat).formatted}
        </td>
    {/each}
</tr>
