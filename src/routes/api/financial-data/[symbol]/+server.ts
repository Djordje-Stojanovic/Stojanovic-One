import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertStatementToUSD } from '$lib/utils/currencyConverter';
import type { FMPIncomeStatement, FMPBalanceSheet, FMPCashFlowStatement } from './types/fmpTypes';
import { transformIncomeStatement, transformBalanceSheet, transformCashFlow } from './types/transformers';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';

const supabase = createClient(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY);

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

        // If force refresh or no data exists, delete existing data first
        if (forceRefresh) {
            await Promise.all([
                supabase.from('income_statements').delete().eq('symbol', symbol),
                supabase.from('balance_sheets').delete().eq('symbol', symbol),
                supabase.from('cash_flow_statements').delete().eq('symbol', symbol)
            ]);
        }

        // Fetch from FMP API
        console.log('Fetching data from FMP API for symbol:', symbol);
        
        const [incomeStmtsRes, balanceSheetsRes, cashFlowStmtsRes] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${VITE_FMP_API_KEY}`),
            fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?apikey=${VITE_FMP_API_KEY}`),
            fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?apikey=${VITE_FMP_API_KEY}`)
        ]);

        const [rawIncomeStmts, rawBalanceSheets, rawCashFlowStmts] = await Promise.all([
            incomeStmtsRes.json(),
            balanceSheetsRes.json(),
            cashFlowStmtsRes.json()
        ]);

        // Type assertions and validation
        if (!Array.isArray(rawIncomeStmts) || !Array.isArray(rawBalanceSheets) || !Array.isArray(rawCashFlowStmts)) {
            throw new Error('Invalid API response format');
        }

        const incomeStmts = rawIncomeStmts as FMPIncomeStatement[];
        const balanceSheets = rawBalanceSheets as FMPBalanceSheet[];
        const cashFlowStmts = rawCashFlowStmts as FMPCashFlowStatement[];

        // Get exchange rate if statements exist and currency is not USD
        let exchangeRate = 1;
        if (incomeStmts.length > 0 && incomeStmts[0].reportedCurrency !== 'USD') {
            exchangeRate = await getExchangeRate(incomeStmts[0].reportedCurrency);
            console.log(`Converting ${incomeStmts[0].reportedCurrency} to USD with rate:`, exchangeRate);
        }

        // Transform and insert new data into Supabase using upsert
        const [incomeResult, balanceResult, cashFlowResult] = await Promise.all([
            supabase.from('income_statements').upsert(
                incomeStmts.map(stmt => {
                    const converted = convertStatementToUSD(stmt, exchangeRate);
                    return transformIncomeStatement(stmt as FMPIncomeStatement, symbol, converted as FMPIncomeStatement);
                }),
                { onConflict: 'symbol,date' }
            ).select(),
            
            supabase.from('balance_sheets').upsert(
                balanceSheets.map(stmt => {
                    const converted = convertStatementToUSD(stmt, exchangeRate);
                    return transformBalanceSheet(stmt as FMPBalanceSheet, symbol, converted as FMPBalanceSheet);
                }),
                { onConflict: 'symbol,date' }
            ).select(),
            
            supabase.from('cash_flow_statements').upsert(
                cashFlowStmts.map(stmt => {
                    const converted = convertStatementToUSD(stmt, exchangeRate);
                    return transformCashFlow(stmt as FMPCashFlowStatement, symbol, converted as FMPCashFlowStatement);
                }),
                { onConflict: 'symbol,date' }
            ).select()
        ]);

        // Check for any database operation errors
        if (incomeResult.error || balanceResult.error || cashFlowResult.error) {
            throw new Error(incomeResult.error?.message || balanceResult.error?.message || cashFlowResult.error?.message);
        }

        return json({
            success: true,
            data: {
                income_statements: incomeResult.data as IncomeStatement[],
                balance_sheets: balanceResult.data as BalanceSheet[],
                cash_flow_statements: cashFlowResult.data as CashFlowStatement[]
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
