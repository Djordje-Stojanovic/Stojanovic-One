<script lang="ts">
    import type { CashFlowStatement } from "$lib/types/financialStatements";
    import type { NumberFormat } from "$lib/utils/numberFormat";
    import BaseFinancialTable from './base/BaseFinancialTable.svelte';
    import OperatingSection from './cash-flow/OperatingSection.svelte';
    import InvestingSection from './cash-flow/InvestingSection.svelte';
    import FinancingSection from './cash-flow/FinancingSection.svelte';
    import FreeCashFlowSection from './cash-flow/FreeCashFlowSection.svelte';

    export let statements: CashFlowStatement[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
</script>

<BaseFinancialTable {statements} tableName="Cash Flow Statement">
    <tbody>
        <OperatingSection statements={sortedStatements} {numberFormat} />
        <InvestingSection statements={sortedStatements} {numberFormat} />
        <FinancingSection statements={sortedStatements} {numberFormat} />
        <FreeCashFlowSection statements={sortedStatements} {numberFormat} />
    </tbody>
</BaseFinancialTable>
