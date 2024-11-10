<script lang="ts">
    import type { BalanceSheet } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import BaseFinancialTable from './base/BaseFinancialTable.svelte';
    import AssetsSection from './balance-sheet/AssetsSection.svelte';
    import LiabilitiesSection from './balance-sheet/LiabilitiesSection.svelte';
    import EquitySection from './balance-sheet/EquitySection.svelte';

    export let statements: BalanceSheet[] = [];
    export let numberFormat: NumberFormat = 'abbreviated';

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
</script>

<BaseFinancialTable {statements} tableName="Balance Sheet">
    <tbody>
        <AssetsSection statements={sortedStatements} {numberFormat} />
        <LiabilitiesSection statements={sortedStatements} {numberFormat} />
        <EquitySection statements={sortedStatements} {numberFormat} />
    </tbody>
</BaseFinancialTable>
