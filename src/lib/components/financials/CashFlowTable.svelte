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
        <th class="metric-name header font-medium">Cash Flow Statement</th>
        {#each sortedStatements as statement}
          <th class="value-cell font-medium">{formatDate(statement.date)}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <!-- Operating Activities -->
      <tr>
        <td class="metric-name section-header">Operating Activities</td>
        {#each sortedStatements as statement}
          <td class="value-cell section-header"></td>
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
      <tr>
        <td class="metric-name section-header">Investing Activities</td>
        {#each sortedStatements as statement}
          <td class="value-cell section-header"></td>
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
      <tr>
        <td class="metric-name section-header">Financing Activities</td>
        {#each sortedStatements as statement}
          <td class="value-cell section-header"></td>
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
      <tr>
        <td class="metric-name section-header">Free Cash Flow</td>
        {#each sortedStatements as statement}
          <td class="value-cell section-header"></td>
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
