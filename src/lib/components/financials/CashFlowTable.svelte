<script lang="ts">
  import { formatNumber } from "$lib/utils/numberFormat";
  import type { CashFlowStatement } from "$lib/types/financialStatements";
  import type { NumberFormat } from "$lib/utils/numberFormat";

  export let statements: CashFlowStatement[] = [];
  export let numberFormat: NumberFormat = 'abbreviated';

  $: sortedYears = statements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric' });
  }
</script>
<style>
    .table-container {
        overflow-x: auto;
        background: #1F2937;
        border-radius: 0.375rem;
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

<div class="table-container">
  <table class="w-full text-sm text-[#F9FAFB]">
    <thead>
      <tr class="border-b border-[#374151]">
        <th class="metric-name header font-medium">Cash Flow Statement</th>
        {#each sortedYears as year}
          <th class="value-cell font-medium">{formatDate(year.date)}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <!-- Operating Activities -->
      <tr>
        <td class="metric-name section-header">Operating Activities</td>
        {#each sortedYears as year}
          <td class="value-cell section-header"></td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Net Income</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.net_income, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Depreciation & Amortization</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.depreciation_and_amortization, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Stock Based Compensation</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.stock_based_compensation, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Change in Working Capital</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.change_in_working_capital, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Operating Cash Flow</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.net_cash_provided_by_operating_activities, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <!-- Investing Activities -->
      <tr>
        <td class="metric-name section-header">Investing Activities</td>
        {#each sortedYears as year}
          <td class="value-cell section-header"></td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Capital Expenditure</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.capital_expenditure, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Acquisitions</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.acquisitions_net, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Net Investing Cash Flow</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.net_cash_used_for_investing_activities, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <!-- Financing Activities -->
      <tr>
        <td class="metric-name section-header">Financing Activities</td>
        {#each sortedYears as year}
          <td class="value-cell section-header"></td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Debt Repayment</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.debt_repayment, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Share Repurchases</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.common_stock_repurchased, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr>
        <td class="metric-name metric-row">Dividends Paid</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.dividends_paid, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Net Financing Cash Flow</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.net_cash_used_provided_by_financing_activities, numberFormat).formatted}
          </td>
        {/each}
      </tr>

      <!-- Free Cash Flow -->
      <tr>
        <td class="metric-name section-header">Free Cash Flow</td>
        {#each sortedYears as year}
          <td class="value-cell section-header"></td>
        {/each}
      </tr>

      <tr class="total-row">
        <td class="metric-name">Free Cash Flow</td>
        {#each sortedYears as year}
          <td class="value-cell">
            {formatNumber(year.free_cash_flow, numberFormat).formatted}
          </td>
        {/each}
      </tr>
    </tbody>
  </table>
</div>
