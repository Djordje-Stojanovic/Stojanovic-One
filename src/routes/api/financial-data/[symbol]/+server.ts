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

interface FMPIncomeStatement extends FMPResponse {
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
    link: string;
    finalLink: string;
}

interface FMPCashFlowStatement extends FMPResponse {
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
    netCashUsedForInvestingActivities: number;
    debtRepayment: number;
    commonStockIssued: number;
    commonStockRepurchased: number;
    dividendsPaid: number;
    otherFinancingActivities: number;
    netCashUsedProvidedByFinancingActivities: number;
    effectOfForexChangesOnCash: number;
    netChangeInCash: number;
    cashAtEndOfPeriod: number;
    cashAtBeginningOfPeriod: number;
    operatingCashFlow: number;
    capitalExpenditure: number;
    freeCashFlow: number;
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
        const [balanceSheetsData, incomeStatementsData, cashFlowStatementsData] = await Promise.all([
            supabase.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
            supabase.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false })
        ]);

        if (balanceSheetsData.error || incomeStatementsData.error || cashFlowStatementsData.error) {
            console.error('Database query error:', { balanceSheetsData, incomeStatementsData, cashFlowStatementsData });
            return json({ error: 'Failed to fetch financial data from database' }, { status: 500 });
        }

        // If we have data in the database, return it
        if (balanceSheetsData.data?.length && incomeStatementsData.data?.length && cashFlowStatementsData.data?.length) {
            return json({
                symbol,
                balanceSheets: balanceSheetsData.data,
                incomeStatements: incomeStatementsData.data,
                cashFlowStatements: cashFlowStatementsData.data
            });
        }

        // If we don't have data, fetch from FMP API
        const [balanceSheets, incomeStatements, cashFlowStatements] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`).then(res => res.json()) as Promise<FMPBalanceSheet[]>,
            fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`).then(res => res.json()) as Promise<FMPIncomeStatement[]>,
            fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=annual&apikey=${VITE_FMP_API_KEY}`).then(res => res.json()) as Promise<FMPCashFlowStatement[]>
        ]);

        // Transform and insert balance sheets
        const transformedBalanceSheets = balanceSheets.map(statement => ({
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
        }));

        // Transform and insert income statements
        const transformedIncomeStatements = incomeStatements.map(statement => ({
            symbol: statement.symbol,
            date: statement.date,
            reported_currency: statement.reportedCurrency,
            cik: statement.cik,
            filling_date: statement.fillingDate,
            accepted_date: statement.acceptedDate,
            calendar_year: statement.calendarYear,
            period: statement.period,
            revenue: statement.revenue,
            cost_of_revenue: statement.costOfRevenue,
            gross_profit: statement.grossProfit,
            gross_profit_ratio: statement.grossProfitRatio,
            research_and_development_expenses: statement.researchAndDevelopmentExpenses,
            general_and_administrative_expenses: statement.generalAndAdministrativeExpenses,
            selling_and_marketing_expenses: statement.sellingAndMarketingExpenses,
            selling_general_and_administrative_expenses: statement.sellingGeneralAndAdministrativeExpenses,
            other_expenses: statement.otherExpenses,
            operating_expenses: statement.operatingExpenses,
            cost_and_expenses: statement.costAndExpenses,
            interest_income: statement.interestIncome,
            interest_expense: statement.interestExpense,
            depreciation_and_amortization: statement.depreciationAndAmortization,
            ebitda: statement.ebitda,
            ebitda_ratio: statement.ebitdaratio,
            operating_income: statement.operatingIncome,
            operating_income_ratio: statement.operatingIncomeRatio,
            total_other_income_expenses_net: statement.totalOtherIncomeExpensesNet,
            income_before_tax: statement.incomeBeforeTax,
            income_before_tax_ratio: statement.incomeBeforeTaxRatio,
            income_tax_expense: statement.incomeTaxExpense,
            net_income: statement.netIncome,
            net_income_ratio: statement.netIncomeRatio,
            eps: statement.eps,
            eps_diluted: statement.epsdiluted,
            weighted_average_shs_out: statement.weightedAverageShsOut,
            weighted_average_shs_out_dil: statement.weightedAverageShsOutDil,
            link: statement.link,
            final_link: statement.finalLink
        }));

        // Transform and insert cash flow statements
        const transformedCashFlowStatements = cashFlowStatements.map(statement => ({
            symbol: statement.symbol,
            date: statement.date,
            reported_currency: statement.reportedCurrency,
            cik: statement.cik,
            filling_date: statement.fillingDate,
            accepted_date: statement.acceptedDate,
            calendar_year: statement.calendarYear,
            period: statement.period,
            net_income: statement.netIncome,
            depreciation_and_amortization: statement.depreciationAndAmortization,
            deferred_income_tax: statement.deferredIncomeTax,
            stock_based_compensation: statement.stockBasedCompensation,
            change_in_working_capital: statement.changeInWorkingCapital,
            accounts_receivables: statement.accountsReceivables,
            inventory: statement.inventory,
            accounts_payables: statement.accountsPayables,
            other_working_capital: statement.otherWorkingCapital,
            other_non_cash_items: statement.otherNonCashItems,
            net_cash_provided_by_operating_activities: statement.netCashProvidedByOperatingActivities,
            investments_in_property_plant_and_equipment: statement.investmentsInPropertyPlantAndEquipment,
            acquisitions_net: statement.acquisitionsNet,
            purchases_of_investments: statement.purchasesOfInvestments,
            sales_maturities_of_investments: statement.salesMaturitiesOfInvestments,
            other_investing_activities: statement.otherInvestingActivites,
            net_cash_used_for_investing_activities: statement.netCashUsedForInvestingActivities,
            debt_repayment: statement.debtRepayment,
            common_stock_issued: statement.commonStockIssued,
            common_stock_repurchased: statement.commonStockRepurchased,
            dividends_paid: statement.dividendsPaid,
            other_financing_activities: statement.otherFinancingActivities,
            net_cash_used_provided_by_financing_activities: statement.netCashUsedProvidedByFinancingActivities,
            effect_of_forex_changes_on_cash: statement.effectOfForexChangesOnCash,
            net_change_in_cash: statement.netChangeInCash,
            cash_at_end_of_period: statement.cashAtEndOfPeriod,
            cash_at_beginning_of_period: statement.cashAtBeginningOfPeriod,
            operating_cash_flow: statement.operatingCashFlow,
            capital_expenditure: statement.capitalExpenditure,
            free_cash_flow: statement.freeCashFlow,
            link: statement.link,
            final_link: statement.finalLink
        }));

        // Insert transformed data into database
        if (transformedBalanceSheets.length > 0) {
            const { error: insertError } = await supabase
                .from('balance_sheets')
                .upsert(transformedBalanceSheets);

            if (insertError) {
                console.error('Error inserting balance sheets:', insertError);
            }
        }

        if (transformedIncomeStatements.length > 0) {
            const { error: insertError } = await supabase
                .from('income_statements')
                .upsert(transformedIncomeStatements);

            if (insertError) {
                console.error('Error inserting income statements:', insertError);
            }
        }

        if (transformedCashFlowStatements.length > 0) {
            const { error: insertError } = await supabase
                .from('cash_flow_statements')
                .upsert(transformedCashFlowStatements);

            if (insertError) {
                console.error('Error inserting cash flow statements:', insertError);
            }
        }

        // Return the transformed data
        return json({
            symbol,
            balanceSheets: transformedBalanceSheets,
            incomeStatements: transformedIncomeStatements,
            cashFlowStatements: transformedCashFlowStatements
        });

    } catch (error) {
        console.error('Error in financial-data:', error);
        return json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
