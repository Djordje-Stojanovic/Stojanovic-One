import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';
import { VITE_FMP_API_KEY } from '$env/static/private';

interface FMPResponse {
    date: string;
    symbol: string;
    reportedCurrency: string;
    cik: string;
    fillingDate: string;
    acceptedDate: string;
    calendarYear: string;
    period: string;
}

interface FMPBalanceSheet extends FMPResponse {
    cashAndCashEquivalents: number;
    shortTermInvestments: number;
    cashAndShortTermInvestments: number;
    netReceivables: number;
    inventory: number;
    otherCurrentAssets: number;
    totalCurrentAssets: number;
    propertyPlantEquipmentNet: number;
    goodwill: number;
    intangibleAssets: number;
    goodwillAndIntangibleAssets: number;
    longTermInvestments: number;
    taxAssets: number;
    otherNonCurrentAssets: number;
    totalNonCurrentAssets: number;
    otherAssets: number;
    totalAssets: number;
    accountPayables: number;
    shortTermDebt: number;
    taxPayables: number;
    deferredRevenue: number;
    otherCurrentLiabilities: number;
    totalCurrentLiabilities: number;
    longTermDebt: number;
    deferredRevenueNonCurrent: number;
    deferredTaxLiabilitiesNonCurrent: number;
    otherNonCurrentLiabilities: number;
    totalNonCurrentLiabilities: number;
    otherLiabilities: number;
    capitalLeaseObligations: number;
    totalLiabilities: number;
    preferredStock: number;
    commonStock: number;
    retainedEarnings: number;
    accumulatedOtherComprehensiveIncomeLoss: number;
    othertotalStockholdersEquity: number;
    totalStockholdersEquity: number;
    totalEquity: number;
    totalLiabilitiesAndStockholdersEquity: number;
    minorityInterest: number;
    totalLiabilitiesAndTotalEquity: number;
    totalInvestments: number;
    totalDebt: number;
    netDebt: number;
    link: string;
    finalLink: string;
}

export const GET: RequestHandler = async ({ params, request }) => {
    try {
        const symbol = params.symbol;
        if (!symbol) {
            return json({ error: 'Symbol is required' }, { status: 400 });
        }

        // Get the user from the session
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return json({ error: 'No authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First check if we have data in our database
        const { data: existingData, error: dbError } = await supabase
            .from('balance_sheets')
            .select('*')
            .eq('symbol', symbol)
            .order('date', { ascending: false });

        if (dbError) {
            console.error('Database query error:', dbError);
            return json({ error: 'Failed to fetch financial data from database' }, { status: 500 });
        }

        // If we don't have data, fetch from FMP API
        if (!existingData?.length) {
            const response = await fetch(
                `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`
            );

            if (!response.ok) {
                return json({ error: 'Failed to fetch financial data from FMP' }, { status: 500 });
            }

            const fmpData = await response.json() as FMPBalanceSheet[];

            // Insert the new data into our database
            const { error: insertError } = await supabase
                .from('balance_sheets')
                .upsert(fmpData.map(statement => ({
                    symbol: statement.symbol,
                    date: statement.date,
                    reported_currency: statement.reportedCurrency,
                    cik: statement.cik,
                    filling_date: statement.fillingDate,
                    accepted_date: statement.acceptedDate,
                    calendar_year: statement.calendarYear,
                    period: statement.period,
                    cash_and_cash_equivalents: statement.cashAndCashEquivalents,
                    short_term_investments: statement.shortTermInvestments,
                    cash_and_short_term_investments: statement.cashAndShortTermInvestments,
                    net_receivables: statement.netReceivables,
                    inventory: statement.inventory,
                    other_current_assets: statement.otherCurrentAssets,
                    total_current_assets: statement.totalCurrentAssets,
                    property_plant_equipment_net: statement.propertyPlantEquipmentNet,
                    goodwill: statement.goodwill,
                    intangible_assets: statement.intangibleAssets,
                    goodwill_and_intangible_assets: statement.goodwillAndIntangibleAssets,
                    long_term_investments: statement.longTermInvestments,
                    tax_assets: statement.taxAssets,
                    other_non_current_assets: statement.otherNonCurrentAssets,
                    total_non_current_assets: statement.totalNonCurrentAssets,
                    other_assets: statement.otherAssets,
                    total_assets: statement.totalAssets,
                    account_payables: statement.accountPayables,
                    short_term_debt: statement.shortTermDebt,
                    tax_payables: statement.taxPayables,
                    deferred_revenue: statement.deferredRevenue,
                    other_current_liabilities: statement.otherCurrentLiabilities,
                    total_current_liabilities: statement.totalCurrentLiabilities,
                    long_term_debt: statement.longTermDebt,
                    deferred_revenue_non_current: statement.deferredRevenueNonCurrent,
                    deferred_tax_liabilities_non_current: statement.deferredTaxLiabilitiesNonCurrent,
                    other_non_current_liabilities: statement.otherNonCurrentLiabilities,
                    total_non_current_liabilities: statement.totalNonCurrentLiabilities,
                    other_liabilities: statement.otherLiabilities,
                    capital_lease_obligations: statement.capitalLeaseObligations,
                    total_liabilities: statement.totalLiabilities,
                    preferred_stock: statement.preferredStock,
                    common_stock: statement.commonStock,
                    retained_earnings: statement.retainedEarnings,
                    accumulated_other_comprehensive_income_loss: statement.accumulatedOtherComprehensiveIncomeLoss,
                    other_total_stockholders_equity: statement.othertotalStockholdersEquity,
                    total_stockholders_equity: statement.totalStockholdersEquity,
                    total_equity: statement.totalEquity,
                    total_liabilities_and_stockholders_equity: statement.totalLiabilitiesAndStockholdersEquity,
                    minority_interest: statement.minorityInterest,
                    total_liabilities_and_total_equity: statement.totalLiabilitiesAndTotalEquity,
                    total_investments: statement.totalInvestments,
                    total_debt: statement.totalDebt,
                    net_debt: statement.netDebt,
                    link: statement.link,
                    final_link: statement.finalLink
                })));

            if (insertError) {
                console.error('Error inserting data:', insertError);
                return json({ error: 'Failed to store financial data' }, { status: 500 });
            }

            return json({
                symbol,
                statements: fmpData
            });
        }

        // Return the data from our database
        return json({
            symbol,
            statements: existingData
        });

    } catch (error) {
        console.error('Error in financial-data:', error);
        return json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
