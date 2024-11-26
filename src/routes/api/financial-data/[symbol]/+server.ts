import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/supabaseClient';
import { FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertStatementToUSD } from '$lib/utils/currencyConverter';
import type { FMPIncomeStatement, FMPBalanceSheet, FMPCashFlowStatement } from './types/fmpTypes';
import { transformIncomeStatement, transformBalanceSheet, transformCashFlow } from './types/transformers';
import { transformRevenueSegments } from './types/transformers/revenueSegments';
import type { IncomeStatement, BalanceSheet, CashFlowStatement, RevenueSegment } from '$lib/types/financialStatements';

type FinancialStatement = {
    reportedCurrency?: string;
    period?: string;
    [key: string]: unknown;
};

interface RawRevenueSegment {
    [date: string]: {
        [segment: string]: number;
    };
}

type TransformerFunction<T extends FinancialStatement, R> = (
    stmt: T,
    symbol: string,
    converted: T
) => R;

async function fetchFinancialData(symbol: string, period: 'annual' | 'quarter') {
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

async function fetchRevenueSegments(symbol: string, period: 'quarter' | 'annual'): Promise<RawRevenueSegment[]> {
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

async function insertFinancialData<T extends FinancialStatement, R>(
    tableName: string,
    data: T[],
    symbol: string,
    exchangeRate: number,
    transformer: TransformerFunction<T, R>
) {
    if (!Array.isArray(data) || data.length === 0) {
        console.log(`No data to insert for ${tableName}`);
        return { data: [] };
    }

    try {
        // Transform the data
        const transformedData = data.map(stmt => {
            const converted = convertStatementToUSD(stmt, exchangeRate);
            return transformer(stmt, symbol, converted as T);
        });

        // Upsert the data
        const { data: result, error } = await db
            .from(tableName)
            .upsert(transformedData, {
                onConflict: 'symbol,date,period',
                ignoreDuplicates: true
            })
            .select();

        if (error) {
            console.error(`Error upserting ${tableName}:`, error);
            throw error;
        }

        return { data: result };
    } catch (error) {
        console.error(`Error in insertFinancialData for ${tableName}:`, error);
        throw error;
    }
}

async function insertRevenueSegments(data: RawRevenueSegment[], symbol: string) {
    if (!Array.isArray(data) || data.length === 0) {
        console.log('No revenue segments data to insert');
        return { data: [] };
    }

    try {
        console.log('Raw revenue segments data:', JSON.stringify(data, null, 2));
        const transformedData = transformRevenueSegments(data, symbol);
        console.log('Transformed revenue segments data:', JSON.stringify(transformedData, null, 2));

        // First try to verify the table exists
        const { error: tableCheckError } = await db
            .from('revenue_segments')
            .select('id')
            .limit(1);

        if (tableCheckError) {
            console.error('Error checking revenue_segments table:', tableCheckError);
            throw new Error(`Table check failed: ${tableCheckError.message}`);
        }

        const { data: result, error: upsertError } = await db
            .from('revenue_segments')
            .upsert(transformedData, {
                onConflict: 'symbol,date,period',
                ignoreDuplicates: false
            })
            .select();

        if (upsertError) {
            console.error('Error upserting revenue segments:', upsertError);
            throw upsertError;
        }

        return { data: result };
    } catch (error) {
        console.error('Error in insertRevenueSegments:', error);
        throw error;
    }
}

export const GET = (async ({ params, url }) => {
    try {
        const { symbol } = params;
        const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
        
        // First try to get existing data from database
        const [
            existingIncomeStmts, 
            existingBalanceSheets, 
            existingCashFlowStmts,
            existingRevenueSegments
        ] = await Promise.all([
            db.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            db.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            db.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            db.from('revenue_segments').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        // If we have data and no force refresh, return it immediately
        if (!forceRefresh && (
            existingIncomeStmts.data?.length || 
            existingBalanceSheets.data?.length || 
            existingCashFlowStmts.data?.length ||
            existingRevenueSegments.data?.length
        )) {
            return json({
                success: true,
                data: {
                    income_statements: existingIncomeStmts.data as IncomeStatement[],
                    balance_sheets: existingBalanceSheets.data as BalanceSheet[],
                    cash_flow_statements: existingCashFlowStmts.data as CashFlowStatement[],
                    revenue_segments: existingRevenueSegments.data as RevenueSegment[]
                }
            });
        }

        // Fetch both annual and quarterly data from FMP API
        console.log('Fetching data from FMP API for symbol:', symbol);
        
        const [
            [annualIncomeStmts, annualBalanceSheets, annualCashFlowStmts],
            [quarterlyIncomeStmts, quarterlyBalanceSheets, quarterlyCashFlowStmts],
            annualRevenueSegments,
            quarterlyRevenueSegments
        ] = await Promise.all([
            fetchFinancialData(symbol, 'annual'),
            fetchFinancialData(symbol, 'quarter'),
            fetchRevenueSegments(symbol, 'annual'),
            fetchRevenueSegments(symbol, 'quarter')
        ]);

        // Get exchange rate if statements exist and currency is not USD
        let exchangeRate = 1;
        const firstStatement = annualIncomeStmts?.[0] || quarterlyIncomeStmts?.[0];
        if (firstStatement && firstStatement.reportedCurrency !== 'USD') {
            exchangeRate = await getExchangeRate(firstStatement.reportedCurrency);
            console.log(`Converting ${firstStatement.reportedCurrency} to USD with rate:`, exchangeRate);
        }

        // Process annual and quarterly data separately
        await Promise.all([
            // Annual data
            insertFinancialData<FMPIncomeStatement, IncomeStatement>(
                'income_statements',
                annualIncomeStmts,
                symbol,
                exchangeRate,
                transformIncomeStatement
            ),
            insertFinancialData<FMPBalanceSheet, BalanceSheet>(
                'balance_sheets',
                annualBalanceSheets,
                symbol,
                exchangeRate,
                transformBalanceSheet
            ),
            insertFinancialData<FMPCashFlowStatement, CashFlowStatement>(
                'cash_flow_statements',
                annualCashFlowStmts,
                symbol,
                exchangeRate,
                transformCashFlow
            ),
            insertRevenueSegments(annualRevenueSegments, symbol),
            // Quarterly data
            insertFinancialData<FMPIncomeStatement, IncomeStatement>(
                'income_statements',
                quarterlyIncomeStmts,
                symbol,
                exchangeRate,
                transformIncomeStatement
            ),
            insertFinancialData<FMPBalanceSheet, BalanceSheet>(
                'balance_sheets',
                quarterlyBalanceSheets,
                symbol,
                exchangeRate,
                transformBalanceSheet
            ),
            insertFinancialData<FMPCashFlowStatement, CashFlowStatement>(
                'cash_flow_statements',
                quarterlyCashFlowStmts,
                symbol,
                exchangeRate,
                transformCashFlow
            ),
            insertRevenueSegments(quarterlyRevenueSegments, symbol)
        ]);

        // Fetch all data after upsert
        const [finalIncomeStmts, finalBalanceSheets, finalCashFlowStmts, finalRevenueSegments] = await Promise.all([
            db.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            db.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            db.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            db.from('revenue_segments').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        return json({
            success: true,
            data: {
                income_statements: finalIncomeStmts.data as IncomeStatement[],
                balance_sheets: finalBalanceSheets.data as BalanceSheet[],
                cash_flow_statements: finalCashFlowStmts.data as CashFlowStatement[],
                revenue_segments: finalRevenueSegments.data as RevenueSegment[]
            }
        });

    } catch (error) {
        console.error('Financial data error:', error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}) satisfies RequestHandler;
