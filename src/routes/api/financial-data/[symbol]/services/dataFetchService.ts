import { FMP_API_KEY } from '$env/static/private';
import type { RawRevenueSegment } from './types';

export async function fetchFinancialData(symbol: string, period: 'annual' | 'quarter') {
    const [incomeStmtsRes, balanceSheetsRes, cashFlowStmtsRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=${period}&apikey=${FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=${period}&apikey=${FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=${period}&apikey=${FMP_API_KEY}`)
    ]);

    const [incomeStmts, balanceSheets, cashFlowStmts] = await Promise.all([
        incomeStmtsRes.json(),
        balanceSheetsRes.json(),
        cashFlowStmtsRes.json()
    ]);

    if (!Array.isArray(incomeStmts) || !Array.isArray(balanceSheets) || !Array.isArray(cashFlowStmts)) {
        const errorResponse = [incomeStmts, balanceSheets, cashFlowStmts].find(resp => !Array.isArray(resp));
        if (typeof errorResponse === 'object' && errorResponse !== null) {
            throw new Error(errorResponse.message || 'Invalid API response format');
        }
        throw new Error('Invalid API response format');
    }

    return [incomeStmts, balanceSheets, cashFlowStmts];
}

export async function fetchRevenueSegments(symbol: string, period: 'quarter' | 'annual'): Promise<RawRevenueSegment[]> {
    try {
        console.log(`Fetching revenue segments for ${symbol} (${period})`);
        const response = await fetch(
            `https://financialmodelingprep.com/api/v4/revenue-product-segmentation?symbol=${symbol}&period=${period}&structure=flat&apikey=${FMP_API_KEY}`
        );
        
        if (!response.ok) {
            console.error(`Failed to fetch revenue segments: ${response.statusText}`);
            throw new Error(`Failed to fetch revenue segments: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Revenue segments response:', JSON.stringify(data, null, 2));
        
        if (!Array.isArray(data)) {
            console.error('Invalid revenue segments response format:', data);
            throw new Error('Invalid revenue segments response format');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching revenue segments:', error);
        throw error;
    }
}
