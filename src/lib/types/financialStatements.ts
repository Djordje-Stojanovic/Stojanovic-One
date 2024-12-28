export type FinancialPeriod = 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'TTM';

export interface BaseFinancialStatement {
    symbol: string;
    date: string;
    reported_currency: string;
    cik: string;
    filling_date: string;
    accepted_date: string;
    calendar_year: string;
    period: FinancialPeriod;
    link: string;
    final_link: string;
}

// Add index signature to allow string indexing
export interface IncomeStatement extends BaseFinancialStatement {
    [key: string]: string | number;
    revenue: number;
    cost_of_revenue: number;
    gross_profit: number;
    gross_profit_ratio: number;
    research_and_development_expenses: number;
    general_and_administrative_expenses: number;
    selling_and_marketing_expenses: number;
    selling_general_and_administrative_expenses: number;
    other_expenses: number;
    operating_expenses: number;
    cost_and_expenses: number;
    interest_income: number;
    interest_expense: number;
    depreciation_and_amortization: number;
    ebitda: number;
    ebitda_ratio: number;
    operating_income: number;
    operating_income_ratio: number;
    total_other_income_expenses_net: number;
    income_before_tax: number;
    income_before_tax_ratio: number;
    income_tax_expense: number;
    net_income: number;
    net_income_ratio: number;
    eps: number;
    eps_diluted: number;
    weighted_average_shs_out: number;
    weighted_average_shs_out_dil: number;
}

export interface BalanceSheet extends BaseFinancialStatement {
    [key: string]: string | number;
    cash_and_cash_equivalents: number;
    short_term_investments: number;
    cash_and_short_term_investments: number;
    net_receivables: number;
    inventory: number;
    other_current_assets: number;
    total_current_assets: number;
    property_plant_equipment_net: number;
    goodwill: number;
    intangible_assets: number;
    goodwill_and_intangible_assets: number;
    long_term_investments: number;
    tax_assets: number;
    other_non_current_assets: number;
    total_non_current_assets: number;
    other_assets: number;
    total_assets: number;
    account_payables: number;
    short_term_debt: number;
    tax_payables: number;
    deferred_revenue: number;
    other_current_liabilities: number;
    total_current_liabilities: number;
    long_term_debt: number;
    deferred_revenue_non_current: number;
    deferred_tax_liabilities_non_current: number;
    other_non_current_liabilities: number;
    total_non_current_liabilities: number;
    other_liabilities: number;
    capital_lease_obligations: number;
    total_liabilities: number;
    preferred_stock: number;
    common_stock: number;
    retained_earnings: number;
    accumulated_other_comprehensive_income_loss: number;
    other_total_stockholders_equity: number;
    total_stockholders_equity: number;
    total_equity: number;
    total_liabilities_and_stockholders_equity: number;
    minority_interest: number;
    total_liabilities_and_total_equity: number;
    total_investments: number;
    total_debt: number;
    net_debt: number;
}

export interface CashFlowStatement extends BaseFinancialStatement {
    [key: string]: string | number;
    net_income: number;
    depreciation_and_amortization: number;
    deferred_income_tax: number;
    stock_based_compensation: number;
    change_in_working_capital: number;
    accounts_receivables: number;
    inventory: number;
    accounts_payables: number;
    other_working_capital: number;
    other_non_cash_items: number;
    net_cash_provided_by_operating_activities: number;
    investments_in_property_plant_and_equipment: number;
    acquisitions_net: number;
    purchases_of_investments: number;
    sales_maturities_of_investments: number;
    other_investing_activities: number;
    net_cash_used_for_investing_activities: number;
    debt_repayment: number;
    common_stock_issued: number;
    common_stock_repurchased: number;
    dividends_paid: number;
    other_financing_activities: number;
    net_cash_used_provided_by_financing_activities: number;
    effect_of_forex_changes_on_cash: number;
    net_change_in_cash: number;
    cash_at_end_of_period: number;
    cash_at_beginning_of_period: number;
    operating_cash_flow: number;
    capital_expenditure: number;
    free_cash_flow: number;
}

export interface RevenueSegment {
    id?: bigint;
    symbol: string;
    date: string;
    reported_currency: string;
    period: FinancialPeriod;
    segments: { [segment: string]: number };
    created_at?: string;
    updated_at?: string;
}

export interface RevenueGeoSegment {
    id?: bigint;
    symbol: string;
    date: string;
    reported_currency: string;
    period: FinancialPeriod;
    segments: { [region: string]: number };
    created_at?: string;
    updated_at?: string;
}

export interface StockPrice {
    id?: bigint;
    symbol: string;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adj_close: number;
    volume: number;
    created_at?: string;
    updated_at?: string;
}

export interface FinancialData {
    income_statements: IncomeStatement[];
    balance_sheets: BalanceSheet[];
    cash_flow_statements: CashFlowStatement[];
    revenue_segments?: RevenueSegment[];
    revenue_geo_segments?: RevenueGeoSegment[];
    stock_prices?: StockPrice[];
}
