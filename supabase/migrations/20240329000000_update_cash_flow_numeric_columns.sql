-- Update cash_flow_statements numeric columns to use NUMERIC(20,2)
ALTER TABLE cash_flow_statements
ALTER COLUMN net_income TYPE NUMERIC(20,2),
ALTER COLUMN depreciation_and_amortization TYPE NUMERIC(20,2),
ALTER COLUMN deferred_income_tax TYPE NUMERIC(20,2),
ALTER COLUMN stock_based_compensation TYPE NUMERIC(20,2),
ALTER COLUMN change_in_working_capital TYPE NUMERIC(20,2),
ALTER COLUMN accounts_receivables TYPE NUMERIC(20,2),
ALTER COLUMN inventory TYPE NUMERIC(20,2),
ALTER COLUMN accounts_payables TYPE NUMERIC(20,2),
ALTER COLUMN other_working_capital TYPE NUMERIC(20,2),
ALTER COLUMN other_non_cash_items TYPE NUMERIC(20,2),
ALTER COLUMN net_cash_provided_by_operating_activities TYPE NUMERIC(20,2),
ALTER COLUMN investments_in_property_plant_and_equipment TYPE NUMERIC(20,2),
ALTER COLUMN acquisitions_net TYPE NUMERIC(20,2),
ALTER COLUMN purchases_of_investments TYPE NUMERIC(20,2),
ALTER COLUMN sales_maturities_of_investments TYPE NUMERIC(20,2),
ALTER COLUMN other_investing_activities TYPE NUMERIC(20,2),
ALTER COLUMN net_cash_used_for_investing_activities TYPE NUMERIC(20,2),
ALTER COLUMN debt_repayment TYPE NUMERIC(20,2),
ALTER COLUMN common_stock_issued TYPE NUMERIC(20,2),
ALTER COLUMN common_stock_repurchased TYPE NUMERIC(20,2),
ALTER COLUMN dividends_paid TYPE NUMERIC(20,2),
ALTER COLUMN other_financing_activities TYPE NUMERIC(20,2),
ALTER COLUMN net_cash_used_provided_by_financing_activities TYPE NUMERIC(20,2),
ALTER COLUMN effect_of_forex_changes_on_cash TYPE NUMERIC(20,2),
ALTER COLUMN net_change_in_cash TYPE NUMERIC(20,2),
ALTER COLUMN cash_at_end_of_period TYPE NUMERIC(20,2),
ALTER COLUMN cash_at_beginning_of_period TYPE NUMERIC(20,2),
ALTER COLUMN operating_cash_flow TYPE NUMERIC(20,2),
ALTER COLUMN capital_expenditure TYPE NUMERIC(20,2),
ALTER COLUMN free_cash_flow TYPE NUMERIC(20,2);