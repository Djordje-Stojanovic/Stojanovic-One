import type { ValuationMetricType } from '$lib/stores/financial-charts/types/ChartTypes';
import type { FinancialData } from '$lib/types/financialStatements';
import type { StockPrice } from '$lib/types/stockPrices';
import { chartStore } from '$lib/stores/chartStore';
import { getHistoricalPrices } from '$lib/services/stockPriceService';
import { calculatePERatio } from '../metrics/peRatio';
import { calculateFCFYield } from '../metrics/fcfYield';
import { calculatePSRatio } from '../metrics/psRatio';
import { calculateEVEBITDA } from '../metrics/evEbitda';
import { calculatePGPRatio } from '../metrics/pgpRatio';
import { calculatePBRatio } from '../metrics/pb';
import { calculatePTBRatio } from '../metrics/ptb';
import { metricConfigs } from '../config';

const metricCalculators = {
    pe: calculatePERatio,
    fcfYield: calculateFCFYield,
    ps: calculatePSRatio,
    evEbitda: calculateEVEBITDA,
    pgp: calculatePGPRatio,
    pb: calculatePBRatio,
    ptb: calculatePTBRatio
};

export async function updateMetricData(type: ValuationMetricType, symbol: string, selectedYears: number, financialData: FinancialData) {
    try {
        const prices = await getHistoricalPrices(symbol, selectedYears);
        
        if (!prices?.length) {
            throw new Error('No price data available');
        }

        if (!financialData) {
            throw new Error('Financial data not available');
        }

        // Filter out any prices with null adj_close
        const validPrices = prices.filter((p): p is StockPrice & { adj_close: number } => 
            p.adj_close !== null
        );

        const calculator = metricCalculators[type];
        const { values, dates } = calculator(validPrices, financialData);

        if (!values.length || !dates.length) {
            throw new Error('Calculation returned no data');
        }

        // Update data without toggling the metric state
        chartStore.handleMetricClick(metricConfigs[type].name, values, dates);
    } catch (error) {
        console.error('Error updating metric:', error);
    }
}

export async function handleValuationMetricClick(type: ValuationMetricType, symbol: string, selectedYears: number, financialData: FinancialData) {
    try {
        await updateMetricData(type, symbol, selectedYears, financialData);
        chartStore.toggleValuationMetric(type);
    } catch (error) {
        console.error('Error in handleMetricClick:', error);
        throw error;
    }
}
