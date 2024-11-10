<script lang="ts">
    import type { IncomeStatement } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import BaseFinancialTable from './base/BaseFinancialTable.svelte';
    import RevenueSection from './income-statement/RevenueSection.svelte';
    import OperatingExpensesSection from './income-statement/OperatingExpensesSection.svelte';
    import OtherIncomeSection from './income-statement/OtherIncomeSection.svelte';
    import PerShareSection from './income-statement/PerShareSection.svelte';

    export let statements: IncomeStatement[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
</script>

<BaseFinancialTable {statements} tableName="Income Statement">
    <tbody>
        <RevenueSection statements={sortedStatements} {numberFormat} />
        <OperatingExpensesSection statements={sortedStatements} {numberFormat} />
        <OtherIncomeSection statements={sortedStatements} {numberFormat} />
        <PerShareSection statements={sortedStatements} {numberFormat} />
    </tbody>
</BaseFinancialTable>
