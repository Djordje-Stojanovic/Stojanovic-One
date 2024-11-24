import { writable } from 'svelte/store';
import type { ChartMetric } from '$lib/components/financials/types';
import type { FinancialData } from '$lib/types/financialStatements';
import { loadShowChart, saveShowChart, loadSelectedMetrics, saveSelectedMetrics } from '$lib/components/financials/state/chartState';

interface ChartStore {
    showChart: boolean;
    selectedMetrics: ChartMetric[];
    selectedMetricNames: string[];
}

function createChartStore() {
    const storedMetricNames = loadSelectedMetrics();
    
    const initialState: ChartStore = {
        showChart: loadShowChart(),
        selectedMetrics: [],
        selectedMetricNames: storedMetricNames
    };

    const { subscribe, set, update } = writable(initialState);

    // Map display names to actual field names
    const fieldNameMap: Record<string, string> = {
        'Revenue': 'revenue',
        'Net Income': 'net_income',
        'Operating Income': 'operating_income',
        'Gross Profit': 'gross_profit',
        'EBITDA': 'ebitda',
        'EPS': 'eps',
        'EPS Diluted': 'eps_diluted',
        'Total Assets': 'total_assets',
        'Total Liabilities': 'total_liabilities',
        'Total Equity': 'total_stockholders_equity',
        'Operating Cash Flow': 'operating_cash_flow',
        'Free Cash Flow': 'free_cash_flow',
        'Cash and Equivalents': 'cash_and_cash_equivalents'
    };

    function getFieldName(displayName: string): string {
        return fieldNameMap[displayName] || displayName.toLowerCase().replace(/\s+/g, '_');
    }

    return {
        subscribe,
        updateMetrics: (financialData: FinancialData, activeTab: string) => update(state => {
            if (!financialData || !state.selectedMetricNames.length) return state;

            const statements = activeTab === 'income' ? financialData.income_statements :
                             activeTab === 'balance' ? financialData.balance_sheets :
                             financialData.cash_flow_statements;

            if (!statements?.length) return state;

            // Process each selected metric
            const updatedMetrics = state.selectedMetricNames.map(name => {
                const fieldName = getFieldName(name);
                
                // Get data points for this metric
                const metricData = statements
                    .filter(statement => {
                        const value = statement[fieldName as keyof typeof statement];
                        return typeof value === 'number' && !isNaN(value);
                    })
                    .map(statement => ({
                        date: statement.date,
                        value: statement[fieldName as keyof typeof statement] as number
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return {
                    name,
                    data: metricData
                };
            });

            // Only keep metrics that have data
            const validMetrics = updatedMetrics.filter(m => m.data.length > 0);
            const validMetricNames = validMetrics.map(m => m.name);

            // Update state
            const newState = {
                ...state,
                selectedMetrics: validMetrics,
                selectedMetricNames: validMetricNames,
                showChart: validMetrics.length > 0
            };

            // Save state
            saveShowChart(newState.showChart);
            saveSelectedMetrics(validMetricNames);

            return newState;
        }),
        handleMetricClick: (name: string, values: number[], dates: string[]) => update(state => {
            const existingIndex = state.selectedMetricNames.indexOf(name);

            if (existingIndex !== -1) {
                // Remove metric
                const newMetrics = state.selectedMetrics.filter(m => m.name !== name);
                const newMetricNames = state.selectedMetricNames.filter(n => n !== name);
                
                saveShowChart(newMetrics.length > 0);
                saveSelectedMetrics(newMetricNames);

                return {
                    selectedMetrics: newMetrics,
                    selectedMetricNames: newMetricNames,
                    showChart: newMetrics.length > 0
                };
            } else {
                // Add new metric
                const newMetric = {
                    name,
                    data: dates.map((date, i) => ({
                        date,
                        value: values[i]
                    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                };

                const newMetrics = [...state.selectedMetrics, newMetric];
                const newMetricNames = [...state.selectedMetricNames, name];

                saveShowChart(true);
                saveSelectedMetrics(newMetricNames);

                return {
                    selectedMetrics: newMetrics,
                    selectedMetricNames: newMetricNames,
                    showChart: true
                };
            }
        }),
        clearChart: () => {
            saveShowChart(false);
            saveSelectedMetrics([]);
            set({
                showChart: false,
                selectedMetrics: [],
                selectedMetricNames: []
            });
        }
    };
}

export const chartStore = createChartStore();
