<script lang="ts">
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import { onMount } from 'svelte';

    export let statements: IncomeStatement[] = [];
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

    .metric-row {
        padding-left: 32px !important;
    }

    tr:nth-child(even):not(.section-header):not(.total-row) {
        background: #262f3d;
    }

    tr:nth-child(odd):not(.section-header):not(.total-row) {
        background: #1F2937;
    }

    tr:hover:not(.section-header):not(.total-row) td {
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
                <th class="metric-name header">Income Statement</th>
                {#each sortedStatements as statement}
                    <th class="value-cell">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <!-- Revenue Section -->
            <tr class="section-header">
                <td class="metric-name">Revenue & Gross Profit</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Revenue</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.revenue, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Cost of Revenue</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.cost_of_revenue, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Gross Profit</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.gross_profit, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Operating Expenses Section -->
            <tr class="section-header">
                <td class="metric-name">Operating Expenses</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Research & Development</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.research_and_development_expenses, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">SG&A Expenses</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.selling_general_and_administrative_expenses, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Operating Income</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.operating_income, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Other Income/Expenses Section -->
            <tr class="section-header">
                <td class="metric-name">Other Income/Expenses</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Interest Income</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.interest_income, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Interest Expense</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.interest_expense, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Income Before Tax</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.income_before_tax, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Income Tax Expense</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.income_tax_expense, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr class="total-row">
                <td class="metric-name">Net Income</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.net_income, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Per Share Data Section -->
            <tr class="section-header">
                <td class="metric-name">Per Share Data</td>
                {#each sortedStatements as statement}
                    <td class="value-cell"></td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Basic EPS</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {statement.eps?.toFixed(2)}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Diluted EPS</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {statement.eps_diluted?.toFixed(2)}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Shares Outstanding (Basic)</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.weighted_average_shs_out, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="metric-name metric-row">Shares Outstanding (Diluted)</td>
                {#each sortedStatements as statement}
                    <td class="value-cell">
                        {formatNumber(statement.weighted_average_shs_out_dil, numberFormat).formatted}
                    </td>
                {/each}
            </tr>
        </tbody>
    </table>
</div>
