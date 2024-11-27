import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchFinancialData, fetchRevenueSegments, fetchRevenueGeoSegments } from './services/dataFetchService';
import { getExchangeRateIfNeeded, transformAllStatements, transformSegments, transformGeoSegments } from './services/dataTransformService';
import { getExistingData, upsertFinancialData, upsertRevenueSegments, upsertRevenueGeoSegments } from './services/databaseService';

export const GET = (async ({ params, url }) => {
    try {
        const { symbol } = params;
        const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
        
        // First try to get existing data from database
        const existingData = await getExistingData(symbol);
        
        // If we have data and no force refresh, return it immediately
        if (!forceRefresh && (
            existingData.income_statements.length || 
            existingData.balance_sheets.length || 
            existingData.cash_flow_statements.length ||
            existingData.revenue_segments.length ||
            existingData.revenue_geo_segments?.length
        )) {
            return json({
                success: true,
                data: existingData
            });
        }

        // Fetch both annual and quarterly data from FMP API
        console.log('Fetching data from FMP API for symbol:', symbol);
        
        const [
            [annualIncomeStmts, annualBalanceSheets, annualCashFlowStmts],
            [quarterlyIncomeStmts, quarterlyBalanceSheets, quarterlyCashFlowStmts],
            annualRevenueSegments,
            quarterlyRevenueSegments,
            annualRevenueGeoSegments,
            quarterlyRevenueGeoSegments
        ] = await Promise.all([
            fetchFinancialData(symbol, 'annual'),
            fetchFinancialData(symbol, 'quarter'),
            fetchRevenueSegments(symbol, 'annual'),
            fetchRevenueSegments(symbol, 'quarter'),
            fetchRevenueGeoSegments(symbol, 'annual'),
            fetchRevenueGeoSegments(symbol, 'quarter')
        ]);

        // Get exchange rate if statements exist and currency is not USD
        const exchangeRate = await getExchangeRateIfNeeded(
            annualIncomeStmts?.[0] || quarterlyIncomeStmts?.[0]
        );

        // Transform the financial statements
        const annualStatements = transformAllStatements(
            annualIncomeStmts,
            annualBalanceSheets,
            annualCashFlowStmts,
            symbol,
            exchangeRate
        );

        const quarterlyStatements = transformAllStatements(
            quarterlyIncomeStmts,
            quarterlyBalanceSheets,
            quarterlyCashFlowStmts,
            symbol,
            exchangeRate
        );

        // Transform revenue segments with exchange rate
        const transformedSegments = transformSegments(
            annualRevenueSegments,
            quarterlyRevenueSegments,
            symbol,
            exchangeRate
        );

        // Transform revenue geo segments with exchange rate
        const transformedGeoSegments = transformGeoSegments(
            annualRevenueGeoSegments,
            quarterlyRevenueGeoSegments,
            symbol,
            exchangeRate
        );

        // Split segments by period
        const annualSegments = transformedSegments.filter(
            (s) => s.period === 'FY'
        );
        const quarterlySegments = transformedSegments.filter(
            (s) => ['Q1', 'Q2', 'Q3', 'Q4'].includes(s.period)
        );

        // Split geo segments by period
        const annualGeoSegments = transformedGeoSegments.filter(
            (s) => s.period === 'FY'
        );
        const quarterlyGeoSegments = transformedGeoSegments.filter(
            (s) => ['Q1', 'Q2', 'Q3', 'Q4'].includes(s.period)
        );

        // Upsert all data to database
        await Promise.all([
            // Annual statements
            upsertFinancialData('income_statements', annualStatements.incomeStatements),
            upsertFinancialData('balance_sheets', annualStatements.balanceSheets),
            upsertFinancialData('cash_flow_statements', annualStatements.cashFlowStatements),
            // Quarterly statements
            upsertFinancialData('income_statements', quarterlyStatements.incomeStatements),
            upsertFinancialData('balance_sheets', quarterlyStatements.balanceSheets),
            upsertFinancialData('cash_flow_statements', quarterlyStatements.cashFlowStatements),
            // Revenue segments
            upsertRevenueSegments(annualSegments, quarterlySegments, symbol),
            // Revenue geo segments
            upsertRevenueGeoSegments(annualGeoSegments, quarterlyGeoSegments, symbol)
        ]);

        // Get final data after all upserts
        const finalData = await getExistingData(symbol);

        return json({
            success: true,
            data: finalData
        });

    } catch (error) {
        console.error('Financial data error:', error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}) satisfies RequestHandler;
