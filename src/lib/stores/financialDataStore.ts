import { writable, derived } from 'svelte/store';
import type { FinancialData } from '$lib/types/financialStatements';
import { filterFinancialStatementsByPeriod } from '$lib/utils/financialStatementFilters';
import { loadSelectedPeriod, saveSelectedPeriod } from '$lib/components/financials/state/chartState';

interface FinancialState {
    allData: FinancialData;
    filteredData: FinancialData;
    loading: boolean;
    error: string | null;
    selectedPeriod: 'annual' | 'quarterly' | 'ttm';
    selectedYears: number;
}

const initialState: FinancialState = {
    allData: {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    },
    filteredData: {
        income_statements: [],
        balance_sheets: [],
        cash_flow_statements: []
    },
    loading: false,
    error: null,
    selectedPeriod: loadSelectedPeriod(),
    selectedYears: 10
};

function createFinancialStore() {
    const { subscribe, set, update } = writable<FinancialState>(initialState);

    return {
        subscribe,
        setData: (data: FinancialData) => update(state => {
            const filteredData = filterFinancialStatementsByPeriod(
                data,
                state.selectedPeriod,
                state.selectedYears
            );
            return {
                ...state,
                allData: data,
                filteredData
            };
        }),
        setPeriod: (period: 'annual' | 'quarterly' | 'ttm') => update(state => {
            saveSelectedPeriod(period);
            const filteredData = filterFinancialStatementsByPeriod(
                state.allData,
                period,
                state.selectedYears
            );
            return {
                ...state,
                selectedPeriod: period,
                filteredData
            };
        }),
        setYears: (years: number) => update(state => {
            const filteredData = filterFinancialStatementsByPeriod(
                state.allData,
                state.selectedPeriod,
                years
            );
            return {
                ...state,
                selectedYears: years,
                filteredData
            };
        }),
        setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
        setError: (error: string | null) => update(state => ({ ...state, error })),
        reset: () => set(initialState)
    };
}

export const financialStore = createFinancialStore();

// Derived stores for convenient access
export const filteredData = derived(financialStore, $store => $store.filteredData);
export const loading = derived(financialStore, $store => $store.loading);
export const error = derived(financialStore, $store => $store.error);
export const selectedPeriod = derived(financialStore, $store => $store.selectedPeriod);
export const selectedYears = derived(financialStore, $store => $store.selectedYears);
