/**
 * Maps display names to database field names for financial metrics
 */
export const financialFieldMap: Record<string, string> = {
    // Income Statement - Revenue & Gross Profit
    'Revenue': 'revenue',
    'Cost of Revenue': 'cost_of_revenue',
    'Gross Profit': 'gross_profit',
    'Gross Profit Ratio': 'gross_profit_ratio',

    // Income Statement - Operating Expenses
    'Research & Development': 'research_and_development_expenses',
    'Sales, General & Administrative': 'selling_general_and_administrative_expenses',
    'Operating Expenses': 'operating_expenses',
    'Operating Income': 'operating_income',
    'Operating Income Ratio': 'operating_income_ratio',

    // Income Statement - Other Income & Expenses
    'Interest Income': 'interest_income',
    'Interest Expense': 'interest_expense',
    'Total Other Income/Expenses': 'total_other_income_expenses_net',
    'Income Before Tax': 'income_before_tax',
    'Income Tax Expense': 'income_tax_expense',
    'Net Income': 'net_income',
    'Net Income Ratio': 'net_income_ratio',
    'EBITDA': 'ebitda',
    'EBITDA Ratio': 'ebitda_ratio',

    // Income Statement - Per Share Data
    'EPS': 'eps',
    'EPS Diluted': 'eps_diluted',
    'Weighted Average Shares': 'weighted_average_shs_out',
    'Weighted Average Shares Diluted': 'weighted_average_shs_out_dil',

    // Balance Sheet - Assets
    'Cash & Cash Equivalents': 'cash_and_cash_equivalents',
    'Short Term Investments': 'short_term_investments',
    'Net Receivables': 'net_receivables',
    'Inventory': 'inventory',
    'Total Current Assets': 'total_current_assets',
    'Property, Plant & Equipment': 'property_plant_equipment_net',
    'Goodwill': 'goodwill',
    'Intangible Assets': 'intangible_assets',
    'Long Term Investments': 'long_term_investments',
    'Total Non-Current Assets': 'total_non_current_assets',
    'Total Assets': 'total_assets',

    // Balance Sheet - Liabilities
    'Account Payables': 'account_payables',
    'Short Term Debt': 'short_term_debt',
    'Deferred Revenue': 'deferred_revenue',
    'Total Current Liabilities': 'total_current_liabilities',
    'Long Term Debt': 'long_term_debt',
    'Total Non-Current Liabilities': 'total_non_current_liabilities',
    'Total Liabilities': 'total_liabilities',

    // Balance Sheet - Equity
    'Common Stock': 'common_stock',
    'Retained Earnings': 'retained_earnings',
    'Total Stockholders\' Equity': 'total_stockholders_equity',

    // Cash Flow - Operating Activities
    'Net Income CF': 'net_income',
    'Depreciation & Amortization': 'depreciation_and_amortization',
    'Stock Based Compensation': 'stock_based_compensation',
    'Change in Working Capital': 'change_in_working_capital',
    'Operating Cash Flow': 'operating_cash_flow',

    // Cash Flow - Investing Activities
    'Capital Expenditure': 'capital_expenditure',
    'Acquisitions': 'acquisitions_net',
    'Purchase of Investments': 'purchases_of_investments',
    'Sale of Investments': 'sales_maturities_of_investments',
    'Net Investing Cash Flow': 'net_cash_used_for_investing_activities',

    // Cash Flow - Financing Activities
    'Debt Repayment': 'debt_repayment',
    'Common Stock Issued': 'common_stock_issued',
    'Common Stock Repurchased': 'common_stock_repurchased',
    'Dividends Paid': 'dividends_paid',
    'Net Financing Cash Flow': 'net_cash_used_provided_by_financing_activities',

    // Cash Flow - Summary
    'Free Cash Flow': 'free_cash_flow',
    'Net Change in Cash': 'net_change_in_cash',
    'Cash at End of Period': 'cash_at_end_of_period'
};

/**
 * Converts a display name to its corresponding database field name
 */
export function getFieldName(displayName: string): string {
    // First check exact match in fieldNameMap
    if (financialFieldMap[displayName]) {
        return financialFieldMap[displayName];
    }

    // If not found, convert display name to field name format
    return displayName
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
}
