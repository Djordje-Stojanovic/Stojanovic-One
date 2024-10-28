import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VITE_FMP_API_KEY } from '$env/static/private';
import { supabase } from '$lib/supabaseClient';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface FinancialStatement {
    symbol: string;
    date: string;
    reportedCurrency: string;
    cik: string;
    fillingDate: string;
    acceptedDate: string;
    calendarYear: string;
    period: string;
}

interface IncomeStatement extends FinancialStatement {
    revenue: number;
    netIncome: number;
    eps: number;
    operatingIncome: number;
    grossProfit: number;
    ebitda: number;
}

interface BalanceSheet extends FinancialStatement {
    totalAssets: number;
    totalLiabilities: number;
    totalStockholdersEquity: number;
    cashAndCashEquivalents: number;
    totalInvestments: number;
    totalDebt: number;
}

interface CashFlowStatement extends FinancialStatement {
    operatingCashFlow: number;
    netCashUsedForInvestingActivities: number;
    netCashUsedProvidedByFinancingActivities: number;
    freeCashFlow: number;
    capitalExpenditure: number;
}

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { symbol } = params;
        if (!symbol) {
            return json({ error: 'Symbol is required' }, { status: 400 });
        }

        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try to get data from Supabase first
        const [incomeStmt, balanceSheet, cashFlow] = await Promise.all([
            supabase.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        // If we have data in all tables, return it
        if (incomeStmt.data?.length && balanceSheet.data?.length && cashFlow.data?.length) {
            return json({
                success: true,
                data: {
                    income_statements: incomeStmt.data,
                    balance_sheets: balanceSheet.data,
                    cash_flow_statements: cashFlow.data
                }
            });
        }

        // Fetch from FMP if not in database
        const [incomeResponse, balanceResponse, cashFlowResponse] = await Promise.all([
            fetch(`${FMP_BASE_URL}/income-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`),
            fetch(`${FMP_BASE_URL}/balance-sheet-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`),
            fetch(`${FMP_BASE_URL}/cash-flow-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`)
        ]);

        const [incomeData, balanceData, cashFlowData] = await Promise.all([
            incomeResponse.json() as Promise<IncomeStatement[]>,
            balanceResponse.json() as Promise<BalanceSheet[]>,
            cashFlowResponse.json() as Promise<CashFlowStatement[]>
        ]);

        // Store in respective tables
        await Promise.all([
            supabase.from('income_statements').upsert(
                incomeData.map((item: IncomeStatement) => ({ ...item })),
                { onConflict: 'symbol,date' }
            ),
            supabase.from('balance_sheets').upsert(
                balanceData.map((item: BalanceSheet) => ({ ...item })),
                { onConflict: 'symbol,date' }
            ),
            supabase.from('cash_flow_statements').upsert(
                cashFlowData.map((item: CashFlowStatement) => ({ ...item })),
                { onConflict: 'symbol,date' }
            )
        ]);

        return json({
            success: true,
            data: {
                income_statements: incomeData,
                balance_sheets: balanceData,
                cash_flow_statements: cashFlowData
            }
        });

    } catch (error) {
        console.error('Error processing financial data:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process financial data'
        }, { status: 500 });
    }
};
