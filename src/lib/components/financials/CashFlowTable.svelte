<script lang="ts">
    import type { CashFlowStatement } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';

    const sortedStatements = statements.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    }

    function calculatePercentage(value: number | null, operatingCashFlow: number | null): string {
        if (!value || !operatingCashFlow || operatingCashFlow === 0) return '0.00%';
        return ((value / operatingCashFlow) * 100).toFixed(2) + '%';
    }
</script>

<div class="overflow-x-auto bg-[#1F2937] rounded-[0.375rem] shadow-lg">
    <table class="w-full text-sm text-[#F9FAFB]">
        <thead>
            <tr class="border-b border-[#374151]">
                <th class="px-4 py-2 text-left font-medium">Item</th>
                {#each sortedStatements as statement}
                    <th class="px-4 py-2 text-right font-medium">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <!-- Operating Activities -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium" colspan={100}>Operating Activities</td>
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Net Income</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.net_income || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.net_income, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Depreciation & Amortization</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.depreciation_and_amortization || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.depreciation_and_amortization, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Stock Based Compensation</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.stock_based_compensation || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.stock_based_compensation, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2">Operating Cash Flow</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.operating_cash_flow || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">(100.00%)</span>
                    </td>
                {/each}
            </tr>

            <!-- Investing Activities -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium" colspan={100}>Investing Activities</td>
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Capital Expenditure</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.capital_expenditure || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.capital_expenditure, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Acquisitions</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.acquisitions_net || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.acquisitions_net, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2">Net Investing Cash Flow</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.net_cash_used_for_investing_activities || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.net_cash_used_for_investing_activities, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Financing Activities -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium" colspan={100}>Financing Activities</td>
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Debt Repayment</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.debt_repayment || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.debt_repayment, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Share Repurchases</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.common_stock_repurchased || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.common_stock_repurchased, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8">Dividends Paid</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.dividends_paid || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.dividends_paid, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2">Net Financing Cash Flow</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.net_cash_used_provided_by_financing_activities || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.net_cash_used_provided_by_financing_activities, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Free Cash Flow -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium">Free Cash Flow</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right font-medium">
                        {formatNumber(statement.free_cash_flow || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.free_cash_flow, statement.operating_cash_flow)})
                        </span>
                    </td>
                {/each}
            </tr>
        </tbody>
    </table>
</div>
