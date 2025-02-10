<script lang="ts">
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { ListName } from '$lib/constants/listNames';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import UserStockSearch from '$lib/components/financials/UserStockSearch.svelte';
    import FinancialNavigation from '$lib/components/financials/FinancialNavigation.svelte';

    export let symbol: string;
    export let companyName: string | null;
    export let companyList: ListName | null;
    export let loading: boolean;
    export let numberFormat: NumberFormat;
    export let selectedYears: number;
    export let period: 'annual' | 'quarterly' | 'ttm';
    export let financialData: FinancialData;
</script>

<div class="min-h-screen bg-white dark:bg-[#1F2937] p-4 space-y-4">
    <FinancialNavigation {symbol} {companyList} />
    
    <div class="mb-6">
        <UserStockSearch />
    </div>

    <FinancialsHeader
        {symbol}
        {companyName}
        {loading}
        {numberFormat}
        {selectedYears}
        {period}
        {financialData}
        on:sync
        on:formatChange
        on:yearChange
        on:periodChange
        on:defaultView
    />

    <slot />
</div>
