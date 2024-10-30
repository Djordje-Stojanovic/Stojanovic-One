<script lang="ts">
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let statements: BalanceSheet[] = [];
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

    function calculatePercentage(value: number | null | undefined, totalAssets: number | null | undefined): string {
        const numValue = value === null || value === undefined ? 0 : value;
        const numTotal = totalAssets === null || totalAssets === undefined ? 0 : totalAssets;
        if (numTotal === 0) return '0.00%';
        return ((numValue / numTotal) * 100).toFixed(2) + '%';
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
            <!-- Assets Section -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-10" colspan={100}>Assets</td>
            </tr>

            <!-- Current Assets -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Cash & Equivalents</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.cash_and_cash_equivalents || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.cash_and_cash_equivalents, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Short Term Investments</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.short_term_investments || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.short_term_investments, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Net Receivables</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.net_receivables || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.net_receivables, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Inventory</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.inventory || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.inventory, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Total Current Assets</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.total_current_assets || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.total_current_assets, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Non-Current Assets -->
            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Property, Plant & Equipment</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.property_plant_equipment_net || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.property_plant_equipment_net, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Long Term Investments</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.long_term_investments || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.long_term_investments, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Total Assets</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.total_assets || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">(100.00%)</span>
                    </td>
                {/each}
            </tr>

            <!-- Liabilities Section -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-10" colspan={100}>Liabilities</td>
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Accounts Payable</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.account_payables || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.account_payables, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Short Term Debt</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.short_term_debt || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.short_term_debt, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Total Current Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.total_current_liabilities || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.total_current_liabilities, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Long Term Debt</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.long_term_debt || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.long_term_debt, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Total Liabilities</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.total_liabilities || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.total_liabilities, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <!-- Equity Section -->
            <tr class="border-t border-[#374151] bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 font-medium sticky left-0 bg-[#374151] z-10" colspan={100}>Shareholders' Equity</td>
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Common Stock</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.common_stock || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.common_stock, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300">
                <td class="px-4 py-2 pl-8 sticky left-0 bg-[#1F2937] z-10">Retained Earnings</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.retained_earnings || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.retained_earnings, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>

            <tr class="hover:bg-[#374151] transition-colors duration-300 font-medium">
                <td class="px-4 py-2 sticky left-0 bg-[#1F2937] z-10">Total Equity</td>
                {#each sortedStatements as statement}
                    <td class="px-4 py-2 text-right">
                        {formatNumber(statement.total_equity || 0, numberFormat).formatted}
                        <span class="text-gray-400 text-xs ml-1">
                            ({calculatePercentage(statement.total_equity, statement.total_assets)})
                        </span>
                    </td>
                {/each}
            </tr>
        </tbody>
    </table>
</div>
