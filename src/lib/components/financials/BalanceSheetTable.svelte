<script lang="ts">
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import { onMount } from 'svelte';

    export let statements: BalanceSheet[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';
    let tableContainer: HTMLDivElement;

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric' });
    }

    onMount(() => {
        if (tableContainer) {
            tableContainer.scrollLeft = tableContainer.scrollWidth;
        }
    });

    $: if (tableContainer && statements.length) {
        tableContainer.scrollLeft = tableContainer.scrollWidth;
    }
</script>

<style>
    .table-container {
        overflow-x: auto;
        background: #1F2937;
        border-radius: 0.375rem;
        scroll-behavior: smooth;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
    }

    .metric-name {
        position: sticky;
        left: 0;
        z-index: 10;
        min-width: 250px;
        padding: 12px 16px;
        text-align: left;
        background: inherit;
    }

    .metric-name.header {
        z-index: 11;
        background: #1F2937;
        border-bottom: 2px solid #4B5563;
        padding: 16px;
        font-weight: 600;
    }

    /* Section styling */
    .section-header {
        background: #374151;
        font-weight: 600;
        color: #60A5FA;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        border-top: 2px solid #4B5563;
    }

    .section-header td {
        background: #374151;
        padding: 12px 16px;
    }

    .section-header:not(:first-child) td {
        padding-top: 24px;
    }

    .subsection-header {
        background: #2D3748 !important;
        font-weight: 500;
        color: #9CA3AF;
        padding-left: 24px !important;
        border-bottom: 1px solid #4B5563;
    }

    .subsection-header td {
        background: #2D3748;
        padding: 12px 16px;
    }

    .metric-row {
        padding-left: 32px !important;
    }

    tr:nth-child(even):not(.section-header):not(.subsection-header):not(.total-row) {
        background: #262f3d;
    }

    tr:nth-child(odd):not(.section-header):not(.subsection-header):not(.total-row) {
        background: #1F2937;
    }

    tr:hover:not(.section-header):not(.subsection-header):not(.total-row) td {
        background: #374151;
        transition: background-color 0.15s ease-in-out;
    }

    .total-row td {
        background: #2D3748 !important;
        font-weight: 600;
        border-top: 1px solid #4B5563;
        border-bottom: 1px solid #4B5563;
        padding: 14px 16px;
    }

    .value-cell {
        padding: 12px 16px;
        text-align: right;
        white-space: nowrap;
        background: inherit;
        border-left: 1px solid #374151;
    }

    /* First column styling */
    td:first-child, th:first-child {
        border-left: none;
    }

    /* Last row in each section */
    .total-row:not(:last-child) td {
        border-bottom: 2px solid #4B5563;
        margin-bottom: 16px;
    }

    /* Spacing after sections */
    .section-header td {
        padding-top: 24px;
    }

    /* Header row styling */
    thead tr th {
        background: #1F2937;
        padding: 16px;
        font-weight: 600;
        border-bottom: 2px solid #4B5563;
    }

    /* Sticky header */
    thead tr th {
        position: sticky;
        top: 0;
        z-index: 10;
    }

    /* Ensure proper sticky behavior */
    tbody tr td:first-child {
        background: inherit;
    }
</style>

<div class="table-container" bind:this={tableContainer}>
    <table class="text-sm text-[#F9FAFB]">
        <thead>
            <tr>
                <th class="metric-name header">Balance Sheet</th>
                {#each sortedStatements as statement}
                    <th class="value-cell">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <!-- Assets Section -->
            <tr class="section-header">
                <td class="metric-name">Assets</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <!-- Current Assets -->
            <tr class="subsection-header">
                <td class="metric-name">Current Assets</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Cash & Cash Equivalents</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.cash_and_cash_equivalents || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Short Term Investments</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.short_term_investments || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Net Receivables</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.net_receivables || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Inventory</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.inventory || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Total Current Assets</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.total_current_assets || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Non-Current Assets -->
            <tr class="subsection-header">
                <td class="metric-name">Non-Current Assets</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Property, Plant & Equipment</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.property_plant_equipment_net || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Long Term Investments</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.long_term_investments || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Total Assets</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.total_assets || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Liabilities Section -->
            <tr class="section-header">
                <td class="metric-name">Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <!-- Current Liabilities -->
            <tr class="subsection-header">
                <td class="metric-name">Current Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Accounts Payable</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.account_payables || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Short Term Debt</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.short_term_debt || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Total Current Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.total_current_liabilities || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Non-Current Liabilities -->
            <tr class="subsection-header">
                <td class="metric-name">Non-Current Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Long Term Debt</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.long_term_debt || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Total Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.total_liabilities || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Shareholders' Equity Section -->
            <tr class="section-header">
                <td class="metric-name">Shareholders' Equity</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Common Stock</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.common_stock || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Retained Earnings</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.retained_earnings || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Total Equity</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.total_equity || 0, numberFormat).formatted}
                    </td>
                {/each}
            </tr>
        </tbody>
    </table>
</div>
