<script lang="ts">
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import { onMount } from 'svelte';

    export let statements: BalanceSheet[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';
    let tableContainer: HTMLDivElement;

    const sortedStatements = statements.sort((a, b) => 
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
    }

    .metric-name {
        position: sticky;
        left: 0;
        background: #1F2937;
        z-index: 10;
        min-width: 250px;
        padding: 8px 16px;
        text-align: left;
    }

    .metric-name.header {
        z-index: 11;
    }

    .section-header {
        background: #374151 !important;
        font-weight: 600;
        color: #60A5FA;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
    }

    .subsection-header {
        background: #1F2937 !important;
        font-weight: 500;
        color: #9CA3AF;
        padding-left: 24px !important;
    }

    .metric-row {
        padding-left: 32px !important;
    }

    .total-row {
        font-weight: 600;
        background: #374151 !important;
    }

    tr:hover:not(.section-header):not(.total-row) {
        background: #4B5563;
    }

    .value-cell {
        padding: 8px 16px;
        text-align: right;
        white-space: nowrap;
    }
</style>

<div class="table-container" bind:this={tableContainer}>
    <table class="w-full text-sm text-[#F9FAFB]">
        <thead>
            <tr class="border-b border-[#374151]">
                <th class="metric-name header font-medium">Balance Sheet</th>
                {#each sortedStatements as statement}
                    <th class="value-cell font-medium">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <!-- Rest of the table content remains unchanged -->
            <!-- Assets Section -->
            <tr>
                <td class="metric-name section-header">Assets</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
                {/each}
            </tr>

            <!-- Current Assets -->
            <tr>
                <td class="metric-name subsection-header">Current Assets</td>
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
            <tr>
                <td class="metric-name subsection-header">Non-Current Assets</td>
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
            <tr>
                <td class="metric-name section-header">Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
                {/each}
            </tr>

            <!-- Current Liabilities -->
            <tr>
                <td class="metric-name subsection-header">Current Liabilities</td>
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
            <tr>
                <td class="metric-name subsection-header">Non-Current Liabilities</td>
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
            <tr>
                <td class="metric-name section-header">Shareholders' Equity</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
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
