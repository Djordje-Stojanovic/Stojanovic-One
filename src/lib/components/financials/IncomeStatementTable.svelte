<script lang="ts">
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import { onMount } from 'svelte';

    export let statements: IncomeStatement[] = [];
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
                <th class="metric-name header font-medium">Income Statement</th>
                {#each sortedStatements as statement}
                    <th class="value-cell font-medium">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <!-- Revenue Section -->
            <tr>
                <td class="metric-name section-header">Revenue & Gross Profit</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
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
            <tr>
                <td class="metric-name section-header">Operating Expenses</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
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
            <tr>
                <td class="metric-name section-header">Other Income/Expenses</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
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
            <tr>
                <td class="metric-name section-header">Per Share Data</td>
                {#each sortedStatements as statement}
                    <td class="value-cell section-header"></td>
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
