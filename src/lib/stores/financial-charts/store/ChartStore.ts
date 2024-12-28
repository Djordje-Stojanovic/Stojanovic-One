import { writable } from 'svelte/store';
import type { ChartStoreState, ChartStoreActions, MarginType, ReturnMetricType, ValuationMetricType, ChartMetric } from '../types/ChartTypes';
import type { FinancialData } from '$lib/types/financialStatements';
import { loadShowChart, saveShowChart, loadSelectedMetrics, saveSelectedMetrics } from '$lib/components/financials/state/chartState';
import { getFieldName } from '../mappings/FieldNameMapping';
import { extractMetricData, extractSegmentData, combineDataSets } from '../utils/DataProcessing';
import { 
    calculateNetIncomeMargin,
    calculateGrossProfitMargin,
    calculateOperatingMargin,
    calculateEBITDAMargin,
    calculateFCFMargin,
    calculateOperatingCashFlowMargin
} from '../metrics/margins/Margins';
import {
    calculateROICMetric,
    calculateROCEMetric,
    calculateROEMetric,
    calculateROAMetric
} from '../metrics/returns/Returns';

function createChartStore(): ChartStoreActions {
    const storedMetricNames = loadSelectedMetrics();
    
    const initialState: ChartStoreState = {
        showChart: loadShowChart(),
        selectedMetrics: [],
        selectedMetricNames: storedMetricNames,
        margins: {
            netIncome: false,
            grossProfit: false,
            operating: false,
            ebitda: false,
            fcf: false,
            operatingCashFlow: false
        },
        returnMetrics: {
            roic: false,
            roce: false,
            roe: false,
            roa: false
        },
        valuationMetrics: {
            pe: false,
            fcfYield: false,
            ps: false,
            evEbitda: false,
            pgp: false
        },
        lastFinancialData: null,
        metricVisibility: {}
    };

    const { subscribe, set, update } = writable(initialState);

    function calculateMargins(financialData: FinancialData, state: ChartStoreState): ChartMetric[] {
        const margins: ChartMetric[] = [];

        if (!financialData.income_statements?.length) return margins;

        if (state.margins.netIncome) {
            const margin = calculateNetIncomeMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false});
        }

        if (state.margins.grossProfit) {
            const margin = calculateGrossProfitMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false});
        }

        if (state.margins.operating) {
            const margin = calculateOperatingMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false});
        }

        if (state.margins.ebitda) {
            const margin = calculateEBITDAMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false});
        }

        if (state.margins.fcf) {
            const revenue = financialData.income_statements.map(stmt => stmt.revenue);
            const margin = calculateFCFMargin(financialData.cash_flow_statements, revenue);
            if (margin) margins.push({...margin, hidden: false});
        }

        if (state.margins.operatingCashFlow) {
            const revenue = financialData.income_statements.map(stmt => stmt.revenue);
            const margin = calculateOperatingCashFlowMargin(financialData.cash_flow_statements, revenue);
            if (margin) margins.push({...margin, hidden: false});
        }

        return margins;
    }

    function calculateReturns(financialData: FinancialData, state: ChartStoreState): ChartMetric[] {
        const returns: ChartMetric[] = [];

        if (!financialData.income_statements?.length || !financialData.balance_sheets?.length) return returns;

        if (state.returnMetrics.roic) {
            const metric = calculateROICMetric(financialData.income_statements, financialData.balance_sheets);
            if (metric) returns.push({...metric, hidden: false});
        }

        if (state.returnMetrics.roce) {
            const metric = calculateROCEMetric(financialData.income_statements, financialData.balance_sheets);
            if (metric) returns.push({...metric, hidden: false});
        }

        if (state.returnMetrics.roe) {
            const metric = calculateROEMetric(financialData.income_statements, financialData.balance_sheets);
            if (metric) returns.push({...metric, hidden: false});
        }

        if (state.returnMetrics.roa) {
            const metric = calculateROAMetric(financialData.income_statements, financialData.balance_sheets);
            if (metric) returns.push({...metric, hidden: false});
        }

        return returns;
    }

    return {
        subscribe,

        updateMetrics: (financialData: FinancialData) => update(state => {
            if (!financialData) return state;

            state.lastFinancialData = financialData;

            // Preserve price metric if it exists
            const priceMetric = state.selectedMetrics.find(m => m.name === 'Stock Price');

            const updatedMetrics = state.selectedMetricNames
                .filter(name => name !== 'Stock Price') // Don't process price metric
                .map(name => {
                    const fieldName = getFieldName(name);

                    const incomeData = extractMetricData(financialData.income_statements || [], fieldName);
                    const balanceData = extractMetricData(financialData.balance_sheets || [], fieldName);
                    const cashFlowData = extractMetricData(financialData.cash_flow_statements || [], fieldName);
                    const revenueSegmentsData = extractSegmentData(financialData.revenue_segments, name);
                    const geoSegmentsData = extractSegmentData(financialData.revenue_geo_segments, name);

                    const metricData = combineDataSets(
                        incomeData, 
                        balanceData, 
                        cashFlowData, 
                        revenueSegmentsData, 
                        geoSegmentsData
                    );

                    return {
                        name,
                        data: metricData,
                        hidden: !state.metricVisibility[name]
                    };
                });

            const marginMetrics = calculateMargins(financialData, state);
            const returnMetrics = calculateReturns(financialData, state);
            
            // Add price metric back if it exists
            const allMetrics = [
                ...updatedMetrics,
                ...marginMetrics,
                ...returnMetrics,
                ...(priceMetric ? [priceMetric] : [])
            ].filter(m => !m.name.includes('P/E Ratio')); // Filter out P/E Ratio since it's handled separately

            const hasAnyData = allMetrics.some(m => m.data.length > 0);
            const newState = {
                ...state,
                selectedMetrics: allMetrics,
                showChart: hasAnyData
            };

            saveShowChart(newState.showChart);
            saveSelectedMetrics(newState.selectedMetricNames);

            return newState;
        }),

        handleMetricClick: (name: string, values: number[], dates: string[]) => update(state => {
            const existingIndex = state.selectedMetricNames.indexOf(name);
            const existingMetric = state.selectedMetrics.find(m => m.name === name);

            if (existingIndex !== -1) {
                // Remove metric on second click
                const newMetrics = state.selectedMetrics.filter(m => m.name !== name);
                const newMetricNames = state.selectedMetricNames.filter(n => n !== name);
                const newVisibility = { ...state.metricVisibility };
                delete newVisibility[name];
                
                saveShowChart(newMetrics.length > 0);
                saveSelectedMetrics(newMetricNames);

                return {
                    ...state,
                    selectedMetrics: newMetrics,
                    selectedMetricNames: newMetricNames,
                    showChart: newMetrics.length > 0,
                    metricVisibility: newVisibility
                };
            } else {
                // Add or update metric
                const newMetric = {
                    name,
                    data: dates.map((date, i) => ({
                        date,
                        value: values[i]
                    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                    hidden: existingMetric ? existingMetric.hidden : false
                };

                let newMetrics: ChartMetric[];
                let newMetricNames: string[];

                if (existingIndex !== -1) {
                    // Update existing metric
                    newMetrics = state.selectedMetrics.map(m => 
                        m.name === name ? newMetric : m
                    );
                    newMetricNames = [...state.selectedMetricNames];
                } else {
                    // Add new metric
                    newMetrics = [...state.selectedMetrics, newMetric];
                    newMetricNames = [...state.selectedMetricNames, name];
                }

                saveShowChart(true);
                saveSelectedMetrics(newMetricNames);

                return {
                    ...state,
                    selectedMetrics: newMetrics,
                    selectedMetricNames: newMetricNames,
                    showChart: true,
                    metricVisibility: {
                        ...state.metricVisibility,
                        [name]: true
                    }
                };
            }
        }),

        toggleMetricVisibility: (metricName: string) => update(state => {
            // Only handle visibility for non-margin and non-return metrics
            if (!metricName.includes('Margin') && !['ROIC', 'ROCE', 'ROE', 'ROA'].includes(metricName)) {
                const newVisibility = {
                    ...state.metricVisibility,
                    [metricName]: !state.metricVisibility[metricName]
                };

                const updatedMetrics = state.selectedMetrics.map(metric => {
                    if (metric.name === metricName) {
                        return {
                            ...metric,
                            hidden: !newVisibility[metricName]
                        };
                    }
                    return metric;
                });

                return {
                    ...state,
                    metricVisibility: newVisibility,
                    selectedMetrics: updatedMetrics
                };
            }
            return state;
        }),

        toggleMargin: (marginType: MarginType) => update(state => {
            if (!state.lastFinancialData) return state;

            const newMargins = {
                ...state.margins,
                [marginType]: !state.margins[marginType]
            };

            // Preserve price metric
            const priceMetric = state.selectedMetrics.find(m => m.name === 'Stock Price');

            const baseMetrics = state.selectedMetrics.filter(m => 
                !m.name.includes('Margin') && 
                !['ROIC', 'ROCE', 'ROE', 'ROA', 'Stock Price', 'P/E Ratio'].includes(m.name)
            );

            const marginMetrics = calculateMargins(state.lastFinancialData, {
                ...state,
                margins: newMargins
            });

            const returnMetrics = calculateReturns(state.lastFinancialData, state);

            return {
                ...state,
                margins: newMargins,
                selectedMetrics: [...baseMetrics, ...marginMetrics, ...returnMetrics, ...(priceMetric ? [priceMetric] : [])]
            };
        }),

        toggleReturnMetric: (returnType: ReturnMetricType) => update(state => {
            if (!state.lastFinancialData) return state;

            const newReturnMetrics = {
                ...state.returnMetrics,
                [returnType]: !state.returnMetrics[returnType]
            };

            // Preserve price metric
            const priceMetric = state.selectedMetrics.find(m => m.name === 'Stock Price');

            const baseMetrics = state.selectedMetrics.filter(m => 
                !m.name.includes('Margin') && !['ROIC', 'ROCE', 'ROE', 'ROA', 'Stock Price'].includes(m.name)
            );

            const marginMetrics = calculateMargins(state.lastFinancialData, state);
            const returnMetrics = calculateReturns(state.lastFinancialData, {
                ...state,
                returnMetrics: newReturnMetrics
            });

            return {
                ...state,
                returnMetrics: newReturnMetrics,
                selectedMetrics: [...baseMetrics, ...marginMetrics, ...returnMetrics, ...(priceMetric ? [priceMetric] : [])]
            };
        }),

        toggleValuationMetric: (valuationType: ValuationMetricType) => update(state => {
            const newValuationMetrics = {
                ...state.valuationMetrics,
                [valuationType]: !state.valuationMetrics[valuationType]
            };

            return {
                ...state,
                valuationMetrics: newValuationMetrics
            };
        }),

        clearChart: () => {
            saveShowChart(false);
            saveSelectedMetrics([]);
            set({
                showChart: false,
                selectedMetrics: [],
                selectedMetricNames: [],
                margins: {
                    netIncome: false,
                    grossProfit: false,
                    operating: false,
                    ebitda: false,
                    fcf: false,
                    operatingCashFlow: false
                },
                returnMetrics: {
                    roic: false,
                    roce: false,
                    roe: false,
                    roa: false
                },
                valuationMetrics: {
                    pe: false,
                    fcfYield: false,
                    ps: false,
                    evEbitda: false,
                    pgp: false
                },
                lastFinancialData: null,
                metricVisibility: {}
            });
        }
    };
}

export const chartStore = createChartStore();
