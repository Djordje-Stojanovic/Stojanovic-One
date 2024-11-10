<script lang="ts">
  import { formatNumber } from "$lib/utils/numberFormat";
  import type { CashFlowStatement } from "$lib/types/financialStatements";
  import type { NumberFormat } from "$lib/utils/numberFormat";
  import { onMount } from 'svelte';

  export let statements: CashFlowStatement[] = [];
  export let numberFormat: NumberFormat = 'abbreviated';
  let tableContainer: HTMLDivElement;

  // Sort statements by date (ascending - oldest to newest)
  $: sortedStatements = [...statements].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric' });
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
        <th class="metric-name header">Cash Flow Statement</th>
        {#each sortedStatements as statement}
          <th class="value-cell">{formatDate(statement.date)}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <!-- Operating Activities -->
      <tr class="section-header">
        <td class="metric-name">Operating Activities</td>
        {#each sortedStatements as statement}
          <td class="value-cell"></td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Net Income</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.net_income, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Depreciation & Amortization</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.depreciation_and_amortization, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Stock Based Compensation</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.stock_based_compensation, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Change in Working Capital</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.change_in_working_capital, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Operating Cash Flow</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.net_cash_provided_by_operating_activities, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <!-- Investing Activities -->
      <tr class="section-header">
        <td class="metric-name">Investing Activities</td>
        {#each sortedStatements as statement}
          <td class="value-cell"></td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Capital Expenditure</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.capital_expenditure, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Acquisitions</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.acquisitions_net, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Net Investing Cash Flow</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.net_cash_used_for_investing_activities, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <!-- Financing Activities -->
      <tr class="section-header">
        <td class="metric-name">Financing Activities</td>
        {#each sortedStatements as statement}
          <td class="value-cell"></td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Debt Repayment</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.debt_repayment, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Share Repurchases</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.common_stock_repurchased, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Dividends Paid</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.dividends_paid, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Net Financing Cash Flow</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.net_cash_used_provided_by_financing_activities, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <!-- Free Cash Flow -->
      <tr class="section-header">
        <td class="metric-name">Free Cash Flow</td>
        {#each sortedStatements as statement}
          <td class="value-cell"></td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Free Cash Flow</td>
        {#each sortedStatements as statement}
          <td class="value-cell">
            {formatNumber(statement.free_cash_flow, numberFormat).formatted}
          </td>
        {/each}
      </tr>
    </tbody>
  </table>
</div>
