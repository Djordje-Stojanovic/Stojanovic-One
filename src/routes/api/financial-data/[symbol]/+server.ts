import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchFinancialData, fetchRevenueSegments, fetchRevenueGeoSegments } from './services/dataFetchService';
import { getExchangeRateIfNeeded, transformAllStatements, transformSegments, transformGeoSegments } from './services/dataTransformService';
import { getExistingData, upsertFinancialData, upsertRevenueSegments, upsertRevenueGeoSegments } from './services/databaseService';
import { FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertToUSD } from '$lib/utils/currencyConverter';
import { db } from '$lib/supabaseClient';

interface FMPStockData {
    symbol: string;
    companyName: string;
    currency: string;
    mktCap: number;
    price: number;
    dcf: number;
    sector: string;
    exchange: string;
    country: string;
    image: string;
    isin: string;
    volAvg: number;
    website: string;
    phone: string;
    ipoDate: string;
    beta: number;
    lastDiv: number;
    range: string;
    changes: number;
    cik: string | null;
    cusip: string | null;
    exchangeShortName: string;
    industry: string;
    description: string;
    ceo: string;
    fullTimeEmployees: string;
    address: string;
    city: string;
    state: string | null;
    zip: string;
    dcfDiff: number;
    isEtf: boolean;
    isActivelyTrading: boolean;
    isAdr: boolean;
    isFund: boolean;
}

async function convertMetadataToUSD(stockData: FMPStockData): Promise<Record<string, unknown>> {
    if (stockData.currency === 'USD') {
        return {
            symbol: stockData.symbol,
            company_name: stockData.companyName,
            sector: stockData.sector,
            market_cap: stockData.mktCap,
            exchange: stockData.exchange,
            currency: stockData.currency,
            country: stockData.country,
            logo_url: stockData.image,
            isin: stockData.isin,
            share_outstanding: stockData.volAvg,
            weburl: stockData.website,
            phone: stockData.phone,
            ipo: stockData.ipoDate,
            price: stockData.price,
            beta: stockData.beta,
            vol_avg: stockData.volAvg,
            last_div: stockData.lastDiv,
            price_range: stockData.range,
            changes: stockData.changes,
            cik: stockData.cik,
            cusip: stockData.cusip,
            exchange_short_name: stockData.exchangeShortName,
            industry: stockData.industry,
            description: stockData.description,
            ceo: stockData.ceo,
            full_time_employees: parseInt(stockData.fullTimeEmployees),
            address: stockData.address,
            city: stockData.city,
            state: stockData.state,
            zip: stockData.zip,
            dcf_diff: stockData.dcfDiff,
            dcf: stockData.dcf,
            is_etf: stockData.isEtf,
            is_actively_trading: stockData.isActivelyTrading,
            is_adr: stockData.isAdr,
            is_fund: stockData.isFund
        };
    }

    console.log(`Converting ${stockData.symbol} from ${stockData.currency} to USD...`);
    const exchangeRate = await getExchangeRate(stockData.currency);
    console.log(`Exchange rate for ${stockData.currency}/USD: ${exchangeRate}`);

    // Convert numeric values
    const marketCapUSD = convertToUSD(stockData.mktCap, exchangeRate);
    const priceUSD = convertToUSD(stockData.price, exchangeRate);
    const dcfUSD = convertToUSD(stockData.dcf, exchangeRate);
    const lastDivUSD = convertToUSD(stockData.lastDiv, exchangeRate);

    return {
        symbol: stockData.symbol,
        company_name: stockData.companyName,
        sector: stockData.sector,
        market_cap: marketCapUSD,
        exchange: stockData.exchange,
        currency: stockData.currency,
        country: stockData.country,
        logo_url: stockData.image,
        isin: stockData.isin,
        share_outstanding: stockData.volAvg,
        weburl: stockData.website,
        phone: stockData.phone,
        ipo: stockData.ipoDate,
        price: priceUSD,
        beta: stockData.beta,
        vol_avg: stockData.volAvg,
        last_div: lastDivUSD,
        price_range: stockData.range,
        changes: stockData.changes,
        cik: stockData.cik,
        cusip: stockData.cusip,
        exchange_short_name: stockData.exchangeShortName,
        industry: stockData.industry,
        description: stockData.description,
        ceo: stockData.ceo,
        full_time_employees: parseInt(stockData.fullTimeEmployees),
        address: stockData.address,
        city: stockData.city,
        state: stockData.state,
        zip: stockData.zip,
        dcf_diff: stockData.dcfDiff,
        dcf: dcfUSD,
        is_etf: stockData.isEtf,
        is_actively_trading: stockData.isActivelyTrading,
        is_adr: stockData.isAdr,
        is_fund: stockData.isFund
    };
}

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

        // Fetch company profile and financial data in parallel
        const [
            profileResponse,
            [annualIncomeStmts, annualBalanceSheets, annualCashFlowStmts],
            [quarterlyIncomeStmts, quarterlyBalanceSheets, quarterlyCashFlowStmts],
            annualRevenueSegments,
            quarterlyRevenueSegments,
            annualRevenueGeoSegments,
            quarterlyRevenueGeoSegments
        ] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`),
            fetchFinancialData(symbol, 'annual'),
            fetchFinancialData(symbol, 'quarter'),
            fetchRevenueSegments(symbol, 'annual'),
            fetchRevenueSegments(symbol, 'quarter'),
            fetchRevenueGeoSegments(symbol, 'annual'),
            fetchRevenueGeoSegments(symbol, 'quarter')
        ]);

        // Update stock metadata
        const stockDataArray = await profileResponse.json();
        if (Array.isArray(stockDataArray) && stockDataArray.length > 0) {
            const convertedData = await convertMetadataToUSD(stockDataArray[0] as FMPStockData);
            await db
                .from('stock_metadata')
                .update(convertedData)
                .eq('symbol', symbol);
        }

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
