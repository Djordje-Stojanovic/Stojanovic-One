import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';

interface FMPStatement {
    date: string;
    symbol: string;
    [key: string]: any;
}

interface IncomeStatement extends FMPStatement {
    revenue: number;
    operatingIncome: number;
    netIncome: number;
    eps: number;
}

interface BalanceSheet extends FMPStatement {
    totalAssets: number;
    totalLiabilities: number;
    totalStockholdersEquity: number;
    totalDebt: number;
}

interface CashFlowStatement extends FMPStatement {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
}

const supabase = createClient(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY);

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { symbol } = params;
        
        // First try to get existing data from Supabase
        const [existingIncomeStmts, existingBalanceSheets, existingCashFlowStmts] = await Promise.all([
            supabase.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        // If we have data, return it immediately
        if (existingIncomeStmts.data?.length || existingBalanceSheets.data?.length || existingCashFlowStmts.data?.length) {
            return json({
                success: true,
                data: {
                    income_statements: existingIncomeStmts.data || [],
                    balance_sheets: existingBalanceSheets.data || [],
                    cash_flow_statements: existingCashFlowStmts.data || []
                }
            });
        }

        // If no data exists, fetch from FMP API
        const [incomeStmtsRes, balanceSheetsRes, cashFlowStmtsRes] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${VITE_FMP_API_KEY}`),
            fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?apikey=${VITE_FMP_API_KEY}`),
            fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?apikey=${VITE_FMP_API_KEY}`)
        ]);

        const [incomeStmts, balanceSheets, cashFlowStmts] = await Promise.all([
            incomeStmtsRes.json() as Promise<IncomeStatement[]>,
            balanceSheetsRes.json() as Promise<BalanceSheet[]>,
            cashFlowStmtsRes.json() as Promise<CashFlowStatement[]>
        ]);

        // Insert new data into Supabase with proper error handling
        const [incomeResult, balanceResult, cashFlowResult] = await Promise.all([
            supabase.from('income_statements').upsert(
                incomeStmts.map(stmt => ({
                    symbol,
                    date: stmt.date,
                    revenue: stmt.revenue,
                    operating_income: stmt.operatingIncome,
                    net_income: stmt.netIncome,
                    eps: stmt.eps
                }))
            ).select(),
            
            supabase.from('balance_sheets').upsert(
                balanceSheets.map(stmt => ({
                    symbol,
                    date: stmt.date,
                    total_assets: stmt.totalAssets,
                    total_liabilities: stmt.totalLiabilities,
                    total_equity: stmt.totalStockholdersEquity,
                    total_debt: stmt.totalDebt
                }))
            ).select(),
            
            supabase.from('cash_flow_statements').upsert(
                cashFlowStmts.map(stmt => ({
                    symbol,
                    date: stmt.date,
                    operating_cash_flow: stmt.operatingCashFlow,
                    investing_cash_flow: stmt.investingCashFlow,
                    financing_cash_flow: stmt.financingCashFlow,
                    net_cash_flow: stmt.netCashFlow
                }))
            ).select()
        ]);

        // Check for any database operation errors
        if (incomeResult.error || balanceResult.error || cashFlowResult.error) {
            throw new Error(incomeResult.error?.message || balanceResult.error?.message || cashFlowResult.error?.message);
        }

        return json({
            success: true,
            data: {
                income_statements: incomeResult.data || [],
                balance_sheets: balanceResult.data || [],
                cash_flow_statements: cashFlowResult.data || []
            }
        });

    } catch (error) {
        console.error('Financial data error:', error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
};
