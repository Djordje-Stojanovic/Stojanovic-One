-- Create income_statements table
CREATE TABLE IF NOT EXISTS income_statements (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  reported_currency TEXT,
  cik TEXT,
  filling_date DATE,
  accepted_date TIMESTAMP,
  calendar_year TEXT,
  period TEXT,
  revenue BIGINT,
  cost_of_revenue BIGINT,
  gross_profit BIGINT,
  gross_profit_ratio NUMERIC(10, 9),
  research_and_development_expenses BIGINT,
  general_and_administrative_expenses BIGINT,
  selling_and_marketing_expenses BIGINT,
  selling_general_and_administrative_expenses BIGINT,
  other_expenses BIGINT,
  operating_expenses BIGINT,
  cost_and_expenses BIGINT,
  interest_income BIGINT,
  interest_expense BIGINT,
  depreciation_and_amortization BIGINT,
  ebitda BIGINT,
  ebitda_ratio NUMERIC(10, 9),
  operating_income BIGINT,
  operating_income_ratio NUMERIC(10, 9),
  total_other_income_expenses_net BIGINT,
  income_before_tax BIGINT,
  income_before_tax_ratio NUMERIC(10, 9),
  income_tax_expense BIGINT,
  net_income BIGINT,
  net_income_ratio NUMERIC(10, 9),
  eps NUMERIC(10, 2),
  eps_diluted NUMERIC(10, 2),
  weighted_average_shs_out BIGINT,
  weighted_average_shs_out_dil BIGINT,
  link TEXT,
  final_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, date)
);

-- Create balance_sheets table
CREATE TABLE IF NOT EXISTS balance_sheets (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  reported_currency TEXT,
  cik TEXT,
  filling_date DATE,
  accepted_date TIMESTAMP,
  calendar_year TEXT,
  period TEXT,
  cash_and_cash_equivalents BIGINT,
  short_term_investments BIGINT,
  cash_and_short_term_investments BIGINT,
  net_receivables BIGINT,
  inventory BIGINT,
  other_current_assets BIGINT,
  total_current_assets BIGINT,
  property_plant_equipment_net BIGINT,
  goodwill BIGINT,
  intangible_assets BIGINT,
  goodwill_and_intangible_assets BIGINT,
  long_term_investments BIGINT,
  tax_assets BIGINT,
  other_non_current_assets BIGINT,
  total_non_current_assets BIGINT,
  other_assets BIGINT,
  total_assets BIGINT,
  account_payables BIGINT,
  short_term_debt BIGINT,
  tax_payables BIGINT,
  deferred_revenue BIGINT,
  other_current_liabilities BIGINT,
  total_current_liabilities BIGINT,
  long_term_debt BIGINT,
  deferred_revenue_non_current BIGINT,
  deferred_tax_liabilities_non_current BIGINT,
  other_non_current_liabilities BIGINT,
  total_non_current_liabilities BIGINT,
  other_liabilities BIGINT,
  capital_lease_obligations BIGINT,
  total_liabilities BIGINT,
  preferred_stock BIGINT,
  common_stock BIGINT,
  retained_earnings BIGINT,
  accumulated_other_comprehensive_income_loss BIGINT,
  other_total_stockholders_equity BIGINT,
  total_stockholders_equity BIGINT,
  total_equity BIGINT,
  total_liabilities_and_stockholders_equity BIGINT,
  minority_interest BIGINT,
  total_liabilities_and_total_equity BIGINT,
  total_investments BIGINT,
  total_debt BIGINT,
  net_debt BIGINT,
  link TEXT,
  final_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, date)
);

-- Create cash_flow_statements table
CREATE TABLE IF NOT EXISTS cash_flow_statements (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  reported_currency TEXT,
  cik TEXT,
  filling_date DATE,
  accepted_date TIMESTAMP,
  calendar_year TEXT,
  period TEXT,
  net_income BIGINT,
  depreciation_and_amortization BIGINT,
  deferred_income_tax BIGINT,
  stock_based_compensation BIGINT,
  change_in_working_capital BIGINT,
  accounts_receivables BIGINT,
  inventory BIGINT,
  accounts_payables BIGINT,
  other_working_capital BIGINT,
  other_non_cash_items BIGINT,
  net_cash_provided_by_operating_activities BIGINT,
  investments_in_property_plant_and_equipment BIGINT,
  acquisitions_net BIGINT,
  purchases_of_investments BIGINT,
  sales_maturities_of_investments BIGINT,
  other_investing_activities BIGINT,
  net_cash_used_for_investing_activities BIGINT,
  debt_repayment BIGINT,
  common_stock_issued BIGINT,
  common_stock_repurchased BIGINT,
  dividends_paid BIGINT,
  other_financing_activities BIGINT,
  net_cash_used_provided_by_financing_activities BIGINT,
  effect_of_forex_changes_on_cash BIGINT,
  net_change_in_cash BIGINT,
  cash_at_end_of_period BIGINT,
  cash_at_beginning_of_period BIGINT,
  operating_cash_flow BIGINT,
  capital_expenditure BIGINT,
  free_cash_flow BIGINT,
  link TEXT,
  final_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, date)
);

-- Create indexes on symbol for faster lookups
CREATE INDEX IF NOT EXISTS idx_income_statements_symbol ON income_statements(symbol);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_symbol ON balance_sheets(symbol);
CREATE INDEX IF NOT EXISTS idx_cash_flow_statements_symbol ON cash_flow_statements(symbol);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_income_statements_modtime
BEFORE UPDATE ON income_statements
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_balance_sheets_modtime
BEFORE UPDATE ON balance_sheets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cash_flow_statements_modtime
BEFORE UPDATE ON cash_flow_statements
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
