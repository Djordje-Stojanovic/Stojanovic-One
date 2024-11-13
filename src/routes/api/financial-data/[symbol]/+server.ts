import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertStatementToUSD } from '$lib/utils/currencyConverter';
import type { FMPIncomeStatement, FMPBalanceSheet, FMPCashFlowStatement } from './types/fmpTypes';
import { transformIncomeStatement, transformBalanceSheet, transformCashFlow } from './types/transformers';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';

const supabase = createClient(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY);

type FinancialStatement = {
    reportedCurrency?: string;
    period?: string;
    [key: string]: unknown;
};

type TransformerFunction<T extends FinancialStatement, R> = (
    stmt: T,
    symbol: string,
    converted: T
) => R;

async function fetchFinancialData(symbol: string, period: 'annual' | 'quarter') {
    const [incomeStmtsRes, balanceSheetsRes, cashFlowStmtsRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=${period}&apikey=${VITE_FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=${period}&apikey=${VITE_FMP_API_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=${period}&apikey=${VITE_FMP_API_KEY}`)
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
        const { data: result, error } = await supabase
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

export const GET = (async ({ params, url }) => {
    try {
        const { symbol } = params;
        const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
        
        // First try to get existing data from Supabase
        const [existingIncomeStmts, existingBalanceSheets, existingCashFlowStmts] = await Promise.all([
            supabase.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        // If we have data and no force refresh, return it immediately
        if (!forceRefresh && (existingIncomeStmts.data?.length || existingBalanceSheets.data?.length || existingCashFlowStmts.data?.length)) {
            return json({
                success: true,
                data: {
                    income_statements: existingIncomeStmts.data as IncomeStatement[],
                    balance_sheets: existingBalanceSheets.data as BalanceSheet[],
                    cash_flow_statements: existingCashFlowStmts.data as CashFlowStatement[]
                }
            });
        }

        // Fetch both annual and quarterly data from FMP API
        console.log('Fetching data from FMP API for symbol:', symbol);
        
        const [
            [annualIncomeStmts, annualBalanceSheets, annualCashFlowStmts],
            [quarterlyIncomeStmts, quarterlyBalanceSheets, quarterlyCashFlowStmts]
        ] = await Promise.all([
            fetchFinancialData(symbol, 'annual'),
            fetchFinancialData(symbol, 'quarter')
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
            )
        ]);

        // Fetch all data after upsert
        const [finalIncomeStmts, finalBalanceSheets, finalCashFlowStmts] = await Promise.all([
            supabase.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        return json({
            success: true,
            data: {
                income_statements: finalIncomeStmts.data as IncomeStatement[],
                balance_sheets: finalBalanceSheets.data as BalanceSheet[],
                cash_flow_statements: finalCashFlowStmts.data as CashFlowStatement[]
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
