<script lang="ts">
    import { goto } from '$app/navigation';
    import StockPageButton from '../StockPageButton.svelte';
    import type { ListName } from '$lib/constants/listNames';

    export let symbol: string;
    export let companyList: ListName | null;

    function navigateToFullpage() {
        if (companyList) {
            goto(`/subprojects/investment-analysis-platform/${companyList.toLowerCase()}/${symbol.toLowerCase()}`);
        }
    }
</script>

<div class="flex space-x-4 mb-6">
    <StockPageButton onClick={() => goto('/subprojects/investment-analysis-platform')}>
        Go to IAP
    </StockPageButton>

    {#if companyList}
        <StockPageButton onClick={navigateToFullpage}>
            Go to Fullpage
        </StockPageButton>
    {/if}

    <StockPageButton onClick={() => goto(`/subprojects/investment-analysis-platform/company/${symbol}`)}>
        Wiki
    </StockPageButton>

    <StockPageButton variant="disabled">
        Financials
    </StockPageButton>
</div>
