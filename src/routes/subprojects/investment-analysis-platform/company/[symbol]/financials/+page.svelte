<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { session } from '$lib/stores/sessionStore';
    import { supabase } from '$lib/supabaseClient';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ListName } from '$lib/constants/listNames';
    import StockPageButton from '$lib/components/StockPageButton.svelte';
    import FinancialsHeader from '$lib/components/FinancialsHeader.svelte';
    import FinancialStatementTables from '$lib/components/financials/FinancialStatementTables.svelte';
    import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
    import { findCompanyList, fetchCompanyName, loadFinancialData } from '$lib/services/companyFinancialsService';

    const symbol = $page.params.symbol;
    let financialData: FinancialData = {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    };
    let allFinancialData: FinancialData = {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    };
    let loading = false;
    let error: string | null = null;
    let numberFormat: NumberFormat = 'abbreviated';
    let selectedYears = 10;
    let activeTab: 'income' | 'balance' | 'cashflow' = 'income';
    let companyName: string | null = null;
    let companyList: ListName | null = null;
    let selectedPeriod: 'annual' | 'quarterly' = 'annual';
    let tablesComponent: FinancialStatementTables;

    async function handleLoadFinancialData(forceRefresh = false) {
        if (!$session) {
            const returnUrl = encodeURIComponent($page.url.pathname);
            goto(`/login?returnUrl=${returnUrl}`);
            return;
        }

        loading = true;
        error = null;

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
            error = 'No active session';
            loading = false;
            return;
        }

        const result = await loadFinancialData(symbol, currentSession.access_token, forceRefresh);
        
        if (result.error) {
            error = result.error;
        } else if (result.data) {
            allFinancialData = result.data;
            financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
            if (tablesComponent) {
                setTimeout(() => tablesComponent.scrollToRight(), 100);
            }
        }
        
        loading = false;
    }

    onMount(async () => {
        if ($session) {
            await Promise.all([
                handleLoadFinancialData(),
                fetchCompanyName(symbol).then(name => companyName = name),
                findCompanyList(symbol).then(list => companyList = list)
            ]);
        }
    });

    // Update filtered data when selectedYears or selectedPeriod changes
    $: if (allFinancialData && allFinancialData.income_statements.length > 0) {
        financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);
    }

    // Scroll to right when switching tabs
    $: if (activeTab && tablesComponent) {
        setTimeout(() => tablesComponent.scrollToRight(), 100);
    }

    function navigateToFullpage() {
        if (companyList) {
            goto(`/subprojects/investment-analysis-platform/${companyList.toLowerCase()}/${symbol.toLowerCase()}`);
        }
    }
</script>

<div class="min-h-screen bg-white dark:bg-[#1F2937] p-4 space-y-4">
    <!-- Navigation Buttons -->
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

    <FinancialsHeader
        {symbol}
        {companyName}
        {loading}
        {numberFormat}
        {selectedYears}
        period={selectedPeriod}
        on:refresh={() => handleLoadFinancialData(true)}
        on:formatChange={(e) => numberFormat = e.detail}
        on:yearChange={(e) => selectedYears = e.detail.years}
        on:periodChange={(e) => selectedPeriod = e.detail.period}
    />

    <FinancialStatementTables
        bind:this={tablesComponent}
        bind:activeTab
        {loading}
        {error}
        {financialData}
        {numberFormat}
        {symbol}
    />
</div>
