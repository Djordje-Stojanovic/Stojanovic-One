import type { FinancialData } from '$lib/types/financialStatements';
import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
import { findCompanyList, fetchCompanyName, loadFinancialData } from './companyFinancialsService';
import type { ListName } from '$lib/constants/listNames';
import { goto } from '$app/navigation';

const emptyFinancialData: FinancialData = {
    income_statements: [],
    balance_sheets: [],
    cash_flow_statements: []
};

export async function loadFinancialPageData(
    symbol: string,
    accessToken: string,
    selectedPeriod: 'annual' | 'quarterly' | 'ttm',
    selectedYears: number,
    forceRefresh = false
): Promise<{
    financialData: FinancialData;
    allFinancialData: FinancialData;
    companyName: string | null;
    companyList: ListName | null;
    error: string | null;
}> {
    if (!accessToken) {
        const returnUrl = encodeURIComponent(window.location.pathname);
        goto(`/login?returnUrl=${returnUrl}`);
        return {
            financialData: emptyFinancialData,
            allFinancialData: emptyFinancialData,
            companyName: null,
            companyList: null,
            error: 'Not authenticated'
        };
    }

    try {
        const [dataResult, companyName, companyList] = await Promise.all([
            loadFinancialData(symbol, accessToken, forceRefresh),
            fetchCompanyName(symbol),
            findCompanyList(symbol)
        ]);

        if (dataResult.error || !dataResult.data) {
            return {
                financialData: emptyFinancialData,
                allFinancialData: emptyFinancialData,
                companyName,
                companyList,
                error: dataResult.error || 'No data received'
            };
        }

        const allFinancialData = dataResult.data;
        const financialData = filterFinancialStatementsByPeriod(allFinancialData, selectedPeriod, selectedYears);

        return {
            financialData,
            allFinancialData,
            companyName,
            companyList,
            error: null
        };
    } catch (e) {
        console.error('Error loading financial page data:', e);
        return {
            financialData: emptyFinancialData,
            allFinancialData: emptyFinancialData,
            companyName: null,
            companyList: null,
            error: 'Failed to load financial data'
        };
    }
}
