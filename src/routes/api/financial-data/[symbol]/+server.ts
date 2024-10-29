import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';

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

export const GET = (async ({ params }) => {
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

        // Insert new data into Supabase using upsert
        const [incomeResult, balanceResult, cashFlowResult] = await Promise.all([
            supabase.from('income_statements').upsert(
                incomeStmts.map(stmt => ({
                    symbol,
                    date: stmt.date,
                    reported_currency: stmt.reportedCurrency,
                    cik: stmt.cik,
                    filling_date: stmt.fillingDate,
                    accepted_date: stmt.acceptedDate,
                    calendar_year: stmt.calendarYear,
                    period: stmt.period,
                    revenue: safeNumber(stmt.revenue),
                    cost_of_revenue: safeNumber(stmt.costOfRevenue),
                    gross_profit: safeNumber(stmt.grossProfit),
                    gross_profit_ratio: safeNumber(stmt.grossProfitRatio),
                    research_and_development_expenses: safeNumber(stmt.researchAndDevelopmentExpenses),
                    general_and_administrative_expenses: safeNumber(stmt.generalAndAdministrativeExpenses),
                    selling_and_marketing_expenses: safeNumber(stmt.sellingAndMarketingExpenses),
                    selling_general_and_administrative_expenses: safeNumber(stmt.sellingGeneralAndAdministrativeExpenses),
                    other_expenses: safeNumber(stmt.otherExpenses),
                    operating_expenses: safeNumber(stmt.operatingExpenses),
                    cost_and_expenses: safeNumber(stmt.costAndExpenses),
                    interest_income: safeNumber(stmt.interestIncome),
                    interest_expense: safeNumber(stmt.interestExpense),
                    depreciation_and_amortization: safeNumber(stmt.depreciationAndAmortization),
                    ebitda: safeNumber(stmt.ebitda),
                    ebitda_ratio: safeNumber(stmt.ebitdaratio),
                    operating_income: safeNumber(stmt.operatingIncome),
                    operating_income_ratio: safeNumber(stmt.operatingIncomeRatio),
                    total_other_income_expenses_net: safeNumber(stmt.totalOtherIncomeExpensesNet),
                    income_before_tax: safeNumber(stmt.incomeBeforeTax),
                    income_before_tax_ratio: safeNumber(stmt.incomeBeforeTaxRatio),
                    income_tax_expense: safeNumber(stmt.incomeTaxExpense),
                    net_income: safeNumber(stmt.netIncome),
                    net_income_ratio: safeNumber(stmt.netIncomeRatio),
                    eps: safeNumber(stmt.eps),
                    eps_diluted: safeNumber(stmt.epsdiluted),
                    weighted_average_shs_out: safeNumber(stmt.weightedAverageShsOut),
                    weighted_average_shs_out_dil: safeNumber(stmt.weightedAverageShsOutDil)
                })), 
                { onConflict: 'symbol,date', ignoreDuplicates: true }
            ).select(),
            
            supabase.from('balance_sheets').upsert(
                balanceSheets.map(stmt => ({
                    symbol,
                    date: stmt.date,
                    reported_currency: stmt.reportedCurrency,
                    cik: stmt.cik,
                    filling_date: stmt.fillingDate,
                    accepted_date: stmt.acceptedDate,
                    calendar_year: stmt.calendarYear,
                    period: stmt.period,
                    cash_and_cash_equivalents: safeNumber(stmt.cashAndCashEquivalents),
                    short_term_investments: safeNumber(stmt.shortTermInvestments),
                    cash_and_short_term_investments: safeNumber(stmt.cashAndShortTermInvestments),
                    net_receivables: safeNumber(stmt.netReceivables),
                    inventory: safeNumber(stmt.inventory),
                    other_current_assets: safeNumber(stmt.otherCurrentAssets),
                    total_current_assets: safeNumber(stmt.totalCurrentAssets),
                    property_plant_equipment_net: safeNumber(stmt.propertyPlantEquipmentNet),
                    goodwill: safeNumber(stmt.goodwill),
                    intangible_assets: safeNumber(stmt.intangibleAssets),
                    goodwill_and_intangible_assets: safeNumber(stmt.goodwillAndIntangibleAssets),
                    long_term_investments: safeNumber(stmt.longTermInvestments),
                    tax_assets: safeNumber(stmt.taxAssets),
                    other_non_current_assets: safeNumber(stmt.otherNonCurrentAssets),
                    total_non_current_assets: safeNumber(stmt.totalNonCurrentAssets),
                    other_assets: safeNumber(stmt.otherAssets),
                    total_assets: safeNumber(stmt.totalAssets),
                    account_payables: safeNumber(stmt.accountPayables),
                    short_term_debt: safeNumber(stmt.shortTermDebt),
                    tax_payables: safeNumber(stmt.taxPayables),
                    deferred_revenue: safeNumber(stmt.deferredRevenue),
                    other_current_liabilities: safeNumber(stmt.otherCurrentLiabilities),
                    total_current_liabilities: safeNumber(stmt.totalCurrentLiabilities),
                    long_term_debt: safeNumber(stmt.longTermDebt),
                    deferred_revenue_non_current: safeNumber(stmt.deferredRevenueNonCurrent),
                    deferred_tax_liabilities_non_current: safeNumber(stmt.deferredTaxLiabilitiesNonCurrent),
                    other_non_current_liabilities: safeNumber(stmt.otherNonCurrentLiabilities),
                    total_non_current_liabilities: safeNumber(stmt.totalNonCurrentLiabilities),
                    other_liabilities: safeNumber(stmt.otherLiabilities),
                    capital_lease_obligations: safeNumber(stmt.capitalLeaseObligations),
                    total_liabilities: safeNumber(stmt.totalLiabilities),
                    preferred_stock: safeNumber(stmt.preferredStock),
                    common_stock: safeNumber(stmt.commonStock),
                    retained_earnings: safeNumber(stmt.retainedEarnings),
                    accumulated_other_comprehensive_income_loss: safeNumber(stmt.accumulatedOtherComprehensiveIncomeLoss),
                    other_total_stockholders_equity: safeNumber(stmt.othertotalStockholdersEquity),
                    total_stockholders_equity: safeNumber(stmt.totalStockholdersEquity),
                    total_equity: safeNumber(stmt.totalEquity),
                    total_liabilities_and_stockholders_equity: safeNumber(stmt.totalLiabilitiesAndStockholdersEquity),
                    minority_interest: safeNumber(stmt.minorityInterest),
                    total_liabilities_and_total_equity: safeNumber(stmt.totalLiabilitiesAndTotalEquity),
                    total_investments: safeNumber(stmt.totalInvestments),
                    total_debt: safeNumber(stmt.totalDebt),
                    net_debt: safeNumber(stmt.netDebt)
                })),
                { onConflict: 'symbol,date', ignoreDuplicates: true }
            ).select(),
            
            supabase.from('cash_flow_statements').upsert(
                cashFlowStmts.map(stmt => ({
                    symbol,
                    date: stmt.date,
                    reported_currency: stmt.reportedCurrency,
                    cik: stmt.cik,
                    filling_date: stmt.fillingDate,
                    accepted_date: stmt.acceptedDate,
                    calendar_year: stmt.calendarYear,
                    period: stmt.period,
                    net_income: safeNumber(stmt.netIncome),
                    depreciation_and_amortization: safeNumber(stmt.depreciationAndAmortization),
                    deferred_income_tax: safeNumber(stmt.deferredIncomeTax),
                    stock_based_compensation: safeNumber(stmt.stockBasedCompensation),
                    change_in_working_capital: safeNumber(stmt.changeInWorkingCapital),
                    accounts_receivables: safeNumber(stmt.accountsReceivables),
                    inventory: safeNumber(stmt.inventory),
                    accounts_payables: safeNumber(stmt.accountsPayables),
                    other_working_capital: safeNumber(stmt.otherWorkingCapital),
                    other_non_cash_items: safeNumber(stmt.otherNonCashItems),
                    net_cash_provided_by_operating_activities: safeNumber(stmt.netCashProvidedByOperatingActivities),
                    investments_in_property_plant_and_equipment: safeNumber(stmt.investmentsInPropertyPlantAndEquipment),
                    acquisitions_net: safeNumber(stmt.acquisitionsNet),
                    purchases_of_investments: safeNumber(stmt.purchasesOfInvestments),
                    sales_maturities_of_investments: safeNumber(stmt.salesMaturitiesOfInvestments),
                    other_investing_activities: safeNumber(stmt.otherInvestingActivites),
                    net_cash_used_for_investing_activities: safeNumber(stmt.netCashUsedForInvestingActivites),
                    debt_repayment: safeNumber(stmt.debtRepayment),
                    common_stock_issued: safeNumber(stmt.commonStockIssued),
                    common_stock_repurchased: safeNumber(stmt.commonStockRepurchased),
                    dividends_paid: safeNumber(stmt.dividendsPaid),
                    other_financing_activities: safeNumber(stmt.otherFinancingActivites),
                    net_cash_used_provided_by_financing_activities: safeNumber(stmt.netCashUsedProvidedByFinancingActivities),
                    effect_of_forex_changes_on_cash: safeNumber(stmt.effectOfForexChangesOnCash),
                    net_change_in_cash: safeNumber(stmt.netChangeInCash),
                    cash_at_end_of_period: safeNumber(stmt.cashAtEndOfPeriod),
                    cash_at_beginning_of_period: safeNumber(stmt.cashAtBeginningOfPeriod),
                    operating_cash_flow: safeNumber(stmt.operatingCashFlow),
                    capital_expenditure: safeNumber(stmt.capitalExpenditure),
                    free_cash_flow: safeNumber(stmt.freeCashFlow)
                })),
                { onConflict: 'symbol,date', ignoreDuplicates: true }
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
