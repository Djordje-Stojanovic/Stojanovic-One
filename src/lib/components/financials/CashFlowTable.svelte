<script lang="ts">
  import { formatNumber } from "$lib/utils/numberFormat";
  import type { CashFlowStatement } from "$lib/types/financialStatements";
  import type { NumberFormat } from "$lib/utils/numberFormat";

  export let statements: CashFlowStatement[] = [];
  export let numberFormat: NumberFormat = 'abbreviated';

  $: sortedYears = statements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  function calculatePercentage(value: number, total: number): string {
    if (!total) return '0.00%';
    return ((value / total) * 100).toFixed(2) + '%';
  }
</script>

<style>
  .scroll-right {
    scrollbar-width: auto;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  .scroll-right::-webkit-scrollbar {
    height: 8px;
  }
  .scroll-right::-webkit-scrollbar-track {
    background: transparent;
  }
  .scroll-right::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
  }
  .scroll-right {
    transform: scaleX(-1);
  }
  .scroll-right > table {
    transform: scaleX(-1);
  }
</style>

<div class="overflow-x-auto scroll-right bg-[#1F2937] rounded-[0.375rem] shadow-lg">
  <table class="w-full text-sm text-[#F9FAFB]">
    <thead>
      <tr class="border-b border-[#374151]">
        <th class="px-4 py-2 text-left font-medium sticky left-0 bg-[#1F2937] z-20">Cash Flow Statement</th>
        {#each sortedYears as year}
          <th class="px-4 py-2 text-right font-medium">{formatDate(year.date)}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <!-- Operating Activities -->
      <tr class="border-t border-[#374151] bg-[#374151]">
        <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-20" colspan="100">Operating Activities</td>
      </tr>

      <!-- Net Income -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Net Income</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.net_income, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.net_income, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Depreciation & Amortization -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Depreciation & Amortization</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.depreciation_and_amortization, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.depreciation_and_amortization, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Stock Based Compensation -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Stock Based Compensation</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.stock_based_compensation, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.stock_based_compensation, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Change in Working Capital -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Change in Working Capital</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.change_in_working_capital, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.change_in_working_capital, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Operating Cash Flow -->
      <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
        <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-20">Operating Cash Flow</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.net_cash_provided_by_operating_activities, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">(100.00%)</span>
          </td>
        {/each}
      </tr>

      <!-- Investing Activities -->
      <tr class="border-t border-[#374151] bg-[#374151]">
        <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-20" colspan="100">Investing Activities</td>
      </tr>

      <!-- Capital Expenditure -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Capital Expenditure</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.capital_expenditure, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.capital_expenditure, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Acquisitions -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Acquisitions</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.acquisitions_net, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.acquisitions_net, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Net Investing Cash Flow -->
      <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
        <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-20">Net Investing Cash Flow</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.net_cash_used_for_investing_activities, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.net_cash_used_for_investing_activities, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Financing Activities -->
      <tr class="border-t border-[#374151] bg-[#374151]">
        <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-20" colspan="100">Financing Activities</td>
      </tr>

      <!-- Debt Repayment -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Debt Repayment</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.debt_repayment, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.debt_repayment, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Share Repurchases -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Share Repurchases</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.common_stock_repurchased, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.common_stock_repurchased, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Dividends Paid -->
      <tr class="hover:bg-[#374151] transition-colors duration-300">
        <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-20">Dividends Paid</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.dividends_paid, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.dividends_paid, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Net Financing Cash Flow -->
      <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
        <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-20">Net Financing Cash Flow</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right">
            {formatNumber(year.net_cash_used_provided_by_financing_activities, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.net_cash_used_provided_by_financing_activities, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>

      <!-- Free Cash Flow -->
      <tr class="border-t border-[#374151] bg-[#374151]">
        <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-20">Free Cash Flow</td>
        {#each sortedYears as year}
          <td class="px-4 py-2 text-right font-medium">
            {formatNumber(year.free_cash_flow, numberFormat).formatted}
            <span class="text-gray-400 text-xs ml-1">
              ({calculatePercentage(year.free_cash_flow, year.net_cash_provided_by_operating_activities)})
            </span>
          </td>
        {/each}
      </tr>
    </tbody>
  </table>
</div>
