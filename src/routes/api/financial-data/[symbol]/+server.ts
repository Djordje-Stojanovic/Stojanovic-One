import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertStatementToUSD } from '$lib/utils/currencyConverter';

interface FMPStatement {
    date: string;
    symbol: string;
    reportedCurrency: string;
    cik: string;
    fillingDate: string;
    acceptedDate: string;
    calendarYear: string;
    period: string;
    [key: string]: unknown;
}

interface IncomeStatement extends FMPStatement {
    revenue: number;
    costOfRevenue: number;
    grossProfit: number;
    grossProfitRatio: number;
    researchAndDevelopmentExpenses: number;
    generalAndAdministrativeExpenses: number;
    sellingAndMarketingExpenses: number;
    sellingGeneralAndAdministrativeExpenses: number;
    otherExpenses: number;
    operatingExpenses: number;
    costAndExpenses: number;
    interestIncome: number;
    interestExpense: number;
    depreciationAndAmortization: number;
    ebitda: number;
    ebitdaratio: number;
    operatingIncome: number;
    operatingIncomeRatio: number;
    totalOtherIncomeExpensesNet: number;
    incomeBeforeTax: number;
    incomeBeforeTaxRatio: number;
    incomeTaxExpense: number;
    netIncome: number;
    netIncomeRatio: number;
    eps: number;
    epsdiluted: number;
    weightedAverageShsOut: number;
    weightedAverageShsOutDil: number;
}

interface BalanceSheet extends FMPStatement {
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
}

interface CashFlowStatement extends FMPStatement {
    netIncome: number;
    depreciationAndAmortization: number;
    deferredIncomeTax: number;
    stockBasedCompensation: number;
    changeInWorkingCapital: number;
    accountsReceivables: number;
    inventory: number;
    accountsPayables: number;
    otherWorkingCapital: number;
    otherNonCashItems: number;
    netCashProvidedByOperatingActivities: number;
    investmentsInPropertyPlantAndEquipment: number;
    acquisitionsNet: number;
    purchasesOfInvestments: number;
    salesMaturitiesOfInvestments: number;
    otherInvestingActivites: number;
    netCashUsedForInvestingActivites: number;
    debtRepayment: number;
    commonStockIssued: number;
    commonStockRepurchased: number;
    dividendsPaid: number;
    otherFinancingActivites: number;
    netCashUsedProvidedByFinancingActivities: number;
    effectOfForexChangesOnCash: number;
    netChangeInCash: number;
    cashAtEndOfPeriod: number;
    cashAtBeginningOfPeriod: number;
    operatingCashFlow: number;
    capitalExpenditure: number;
    freeCashFlow: number;
}

const supabase = createClient(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY);

// Helper function to safely convert numbers
function safeNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : Number(num.toFixed(2)); // Round to 2 decimal places
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
                    income_statements: existingIncomeStmts.data || [],
                    balance_sheets: existingBalanceSheets.data || [],
                    cash_flow_statements: existingCashFlowStmts.data || []
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

        const [incomeStmts, balanceSheets, cashFlowStmts] = await Promise.all([
            incomeStmtsRes.json() as Promise<IncomeStatement[]>,
            balanceSheetsRes.json() as Promise<BalanceSheet[]>,
            cashFlowStmtsRes.json() as Promise<CashFlowStatement[]>
        ]);

        // Get exchange rate if statements exist and currency is not USD
        let exchangeRate = 1;
        if (incomeStmts.length > 0 && incomeStmts[0].reportedCurrency !== 'USD') {
            exchangeRate = await getExchangeRate(incomeStmts[0].reportedCurrency);
            console.log(`Converting ${incomeStmts[0].reportedCurrency} to USD with rate:`, exchangeRate);
        }

        // Insert new data into Supabase using upsert
        const [incomeResult, balanceResult, cashFlowResult] = await Promise.all([
            supabase.from('income_statements').upsert(
                incomeStmts.map(stmt => {
                    const convertedStmt = convertStatementToUSD(stmt, exchangeRate);
                    return {
                        symbol,
                        date: stmt.date,
                        reported_currency: stmt.reportedCurrency,
                        cik: stmt.cik,
                        filling_date: stmt.fillingDate,
                        accepted_date: stmt.acceptedDate,
                        calendar_year: stmt.calendarYear,
                        period: stmt.period,
                        revenue: safeNumber(convertedStmt.revenue),
                        cost_of_revenue: safeNumber(convertedStmt.costOfRevenue),
                        gross_profit: safeNumber(convertedStmt.grossProfit),
                        gross_profit_ratio: safeNumber(stmt.grossProfitRatio), // Ratios don't need conversion
                        research_and_development_expenses: safeNumber(convertedStmt.researchAndDevelopmentExpenses),
                        general_and_administrative_expenses: safeNumber(convertedStmt.generalAndAdministrativeExpenses),
                        selling_and_marketing_expenses: safeNumber(convertedStmt.sellingAndMarketingExpenses),
                        selling_general_and_administrative_expenses: safeNumber(convertedStmt.sellingGeneralAndAdministrativeExpenses),
                        other_expenses: safeNumber(convertedStmt.otherExpenses),
                        operating_expenses: safeNumber(convertedStmt.operatingExpenses),
                        cost_and_expenses: safeNumber(convertedStmt.costAndExpenses),
                        interest_income: safeNumber(convertedStmt.interestIncome),
                        interest_expense: safeNumber(convertedStmt.interestExpense),
                        depreciation_and_amortization: safeNumber(convertedStmt.depreciationAndAmortization),
                        ebitda: safeNumber(convertedStmt.ebitda),
                        ebitda_ratio: safeNumber(stmt.ebitdaratio), // Ratios don't need conversion
                        operating_income: safeNumber(convertedStmt.operatingIncome),
                        operating_income_ratio: safeNumber(stmt.operatingIncomeRatio), // Ratios don't need conversion
                        total_other_income_expenses_net: safeNumber(convertedStmt.totalOtherIncomeExpensesNet),
                        income_before_tax: safeNumber(convertedStmt.incomeBeforeTax),
                        income_before_tax_ratio: safeNumber(stmt.incomeBeforeTaxRatio), // Ratios don't need conversion
                        income_tax_expense: safeNumber(convertedStmt.incomeTaxExpense),
                        net_income: safeNumber(convertedStmt.netIncome),
                        net_income_ratio: safeNumber(stmt.netIncomeRatio), // Ratios don't need conversion
                        eps: safeNumber(stmt.eps), // EPS doesn't need conversion
                        eps_diluted: safeNumber(stmt.epsdiluted), // EPS doesn't need conversion
                        weighted_average_shs_out: safeNumber(stmt.weightedAverageShsOut),
                        weighted_average_shs_out_dil: safeNumber(stmt.weightedAverageShsOutDil)
                    };
                }), 
                { onConflict: 'symbol,date' }
            ).select(),
            
            supabase.from('balance_sheets').upsert(
                balanceSheets.map(stmt => {
                    const convertedStmt = convertStatementToUSD(stmt, exchangeRate);
                    return {
                        symbol,
                        date: stmt.date,
                        reported_currency: stmt.reportedCurrency,
                        cik: stmt.cik,
                        filling_date: stmt.fillingDate,
                        accepted_date: stmt.acceptedDate,
                        calendar_year: stmt.calendarYear,
                        period: stmt.period,
                        cash_and_cash_equivalents: safeNumber(convertedStmt.cashAndCashEquivalents),
                        short_term_investments: safeNumber(convertedStmt.shortTermInvestments),
                        cash_and_short_term_investments: safeNumber(convertedStmt.cashAndShortTermInvestments),
                        net_receivables: safeNumber(convertedStmt.netReceivables),
                        inventory: safeNumber(convertedStmt.inventory),
                        other_current_assets: safeNumber(convertedStmt.otherCurrentAssets),
                        total_current_assets: safeNumber(convertedStmt.totalCurrentAssets),
                        property_plant_equipment_net: safeNumber(convertedStmt.propertyPlantEquipmentNet),
                        goodwill: safeNumber(convertedStmt.goodwill),
                        intangible_assets: safeNumber(convertedStmt.intangibleAssets),
                        goodwill_and_intangible_assets: safeNumber(convertedStmt.goodwillAndIntangibleAssets),
                        long_term_investments: safeNumber(convertedStmt.longTermInvestments),
                        tax_assets: safeNumber(convertedStmt.taxAssets),
                        other_non_current_assets: safeNumber(convertedStmt.otherNonCurrentAssets),
                        total_non_current_assets: safeNumber(convertedStmt.totalNonCurrentAssets),
                        other_assets: safeNumber(convertedStmt.otherAssets),
                        total_assets: safeNumber(convertedStmt.totalAssets),
                        account_payables: safeNumber(convertedStmt.accountPayables),
                        short_term_debt: safeNumber(convertedStmt.shortTermDebt),
                        tax_payables: safeNumber(convertedStmt.taxPayables),
                        deferred_revenue: safeNumber(convertedStmt.deferredRevenue),
                        other_current_liabilities: safeNumber(convertedStmt.otherCurrentLiabilities),
                        total_current_liabilities: safeNumber(convertedStmt.totalCurrentLiabilities),
                        long_term_debt: safeNumber(convertedStmt.longTermDebt),
                        deferred_revenue_non_current: safeNumber(convertedStmt.deferredRevenueNonCurrent),
                        deferred_tax_liabilities_non_current: safeNumber(convertedStmt.deferredTaxLiabilitiesNonCurrent),
                        other_non_current_liabilities: safeNumber(convertedStmt.otherNonCurrentLiabilities),
                        total_non_current_liabilities: safeNumber(convertedStmt.totalNonCurrentLiabilities),
                        other_liabilities: safeNumber(convertedStmt.otherLiabilities),
                        capital_lease_obligations: safeNumber(convertedStmt.capitalLeaseObligations),
                        total_liabilities: safeNumber(convertedStmt.totalLiabilities),
                        preferred_stock: safeNumber(convertedStmt.preferredStock),
                        common_stock: safeNumber(convertedStmt.commonStock),
                        retained_earnings: safeNumber(convertedStmt.retainedEarnings),
                        accumulated_other_comprehensive_income_loss: safeNumber(convertedStmt.accumulatedOtherComprehensiveIncomeLoss),
                        other_total_stockholders_equity: safeNumber(convertedStmt.othertotalStockholdersEquity),
                        total_stockholders_equity: safeNumber(convertedStmt.totalStockholdersEquity),
                        total_equity: safeNumber(convertedStmt.totalEquity),
                        total_liabilities_and_stockholders_equity: safeNumber(convertedStmt.totalLiabilitiesAndStockholdersEquity),
                        minority_interest: safeNumber(convertedStmt.minorityInterest),
                        total_liabilities_and_total_equity: safeNumber(convertedStmt.totalLiabilitiesAndTotalEquity),
                        total_investments: safeNumber(convertedStmt.totalInvestments),
                        total_debt: safeNumber(convertedStmt.totalDebt),
                        net_debt: safeNumber(convertedStmt.netDebt)
                    };
                }),
                { onConflict: 'symbol,date' }
            ).select(),
            
            supabase.from('cash_flow_statements').upsert(
                cashFlowStmts.map(stmt => {
                    const convertedStmt = convertStatementToUSD(stmt, exchangeRate);
                    return {
                        symbol,
                        date: stmt.date,
                        reported_currency: stmt.reportedCurrency,
                        cik: stmt.cik,
                        filling_date: stmt.fillingDate,
                        accepted_date: stmt.acceptedDate,
                        calendar_year: stmt.calendarYear,
                        period: stmt.period,
                        net_income: safeNumber(convertedStmt.netIncome),
                        depreciation_and_amortization: safeNumber(convertedStmt.depreciationAndAmortization),
                        deferred_income_tax: safeNumber(convertedStmt.deferredIncomeTax),
                        stock_based_compensation: safeNumber(convertedStmt.stockBasedCompensation),
                        change_in_working_capital: safeNumber(convertedStmt.changeInWorkingCapital),
                        accounts_receivables: safeNumber(convertedStmt.accountsReceivables),
                        inventory: safeNumber(convertedStmt.inventory),
                        accounts_payables: safeNumber(convertedStmt.accountsPayables),
                        other_working_capital: safeNumber(convertedStmt.otherWorkingCapital),
                        other_non_cash_items: safeNumber(convertedStmt.otherNonCashItems),
                        net_cash_provided_by_operating_activities: safeNumber(convertedStmt.netCashProvidedByOperatingActivities),
                        investments_in_property_plant_and_equipment: safeNumber(convertedStmt.investmentsInPropertyPlantAndEquipment),
                        acquisitions_net: safeNumber(convertedStmt.acquisitionsNet),
                        purchases_of_investments: safeNumber(convertedStmt.purchasesOfInvestments),
                        sales_maturities_of_investments: safeNumber(convertedStmt.salesMaturitiesOfInvestments),
                        other_investing_activities: safeNumber(convertedStmt.otherInvestingActivites),
                        net_cash_used_for_investing_activities: safeNumber(convertedStmt.netCashUsedForInvestingActivites),
                        debt_repayment: safeNumber(convertedStmt.debtRepayment),
                        common_stock_issued: safeNumber(convertedStmt.commonStockIssued),
                        common_stock_repurchased: safeNumber(convertedStmt.commonStockRepurchased),
                        dividends_paid: safeNumber(convertedStmt.dividendsPaid),
                        other_financing_activities: safeNumber(convertedStmt.otherFinancingActivites),
                        net_cash_used_provided_by_financing_activities: safeNumber(convertedStmt.netCashUsedProvidedByFinancingActivities),
                        effect_of_forex_changes_on_cash: safeNumber(convertedStmt.effectOfForexChangesOnCash),
                        net_change_in_cash: safeNumber(convertedStmt.netChangeInCash),
                        cash_at_end_of_period: safeNumber(convertedStmt.cashAtEndOfPeriod),
                        cash_at_beginning_of_period: safeNumber(convertedStmt.cashAtBeginningOfPeriod),
                        operating_cash_flow: safeNumber(convertedStmt.operatingCashFlow),
                        capital_expenditure: safeNumber(convertedStmt.capitalExpenditure),
                        free_cash_flow: safeNumber(convertedStmt.freeCashFlow)
                    };
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
}) satisfies RequestHandler;
