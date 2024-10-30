<script lang="ts">
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let statements: IncomeStatement[] = [];
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

    function calculatePercentage(value: number, totalRevenue: number): string {
        if (!totalRevenue) return '0.00%';
        return ((value / totalRevenue) * 100).toFixed(2) + '%';
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
                <th class="px-4 py-2 text-left font-medium sticky left-0 bg-[#1F2937] z-10">Item</th>
                {#each sortedStatements as statement}
                    <th class="px-4 py-2 text-right font-medium">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <!-- Revenue -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-10">Revenue</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right font-medium">
                        {formatNumber(statement.revenue, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <!-- Cost of Revenue -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Cost of Revenue</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.cost_of_revenue, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.cost_of_revenue, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Gross Profit -->
            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Gross Profit</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.gross_profit, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.gross_profit, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- R&D Expenses -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">R&D Expenses</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.research_and_development_expenses, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.research_and_development_expenses, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- SG&A Expenses -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">SG&A Expenses</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.selling_general_and_administrative_expenses, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.selling_general_and_administrative_expenses, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Operating Income -->
            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Operating Income</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.operating_income, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.operating_income, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Interest Income -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Interest Income</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.interest_income, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.interest_income, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Interest Expense -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Interest Expense</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.interest_expense, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.interest_expense, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Income Before Tax -->
            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Income Before Tax</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.income_before_tax, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.income_before_tax, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Income Tax Expense -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Income Tax Expense</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.income_tax_expense, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.income_tax_expense, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Net Income -->
            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Net Income</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.net_income, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.net_income, statement.revenue)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- EPS Section -->
            <tr class="border-t border-[#374151]">
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Basic EPS</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {statement.eps?.toFixed(2)}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Diluted EPS</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {statement.eps_diluted?.toFixed(2)}
                    </td>
                {/each}
            </tr>

            <!-- Shares Outstanding -->
            <tr>
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Shares Outstanding (Basic)</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.weighted_average_shs_out, numberFormat).formatted}
                    </td>
                {/each}
            </tr>

            <tr>
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Shares Outstanding (Diluted)</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.weighted_average_shs_out_dil, numberFormat).formatted}
                    </td>
                {/each}
            </tr>
        </tbody>
    </table>
</div>
