-- First drop existing unique constraints
ALTER TABLE income_statements
DROP CONSTRAINT IF EXISTS income_statements_symbol_date_key;

ALTER TABLE balance_sheets
DROP CONSTRAINT IF EXISTS balance_sheets_symbol_date_key;

ALTER TABLE cash_flow_statements
DROP CONSTRAINT IF EXISTS cash_flow_statements_symbol_date_key;

-- Add new unique constraints including period
ALTER TABLE income_statements
ADD CONSTRAINT income_statements_symbol_date_period_key UNIQUE (symbol, date, period);

ALTER TABLE balance_sheets
ADD CONSTRAINT balance_sheets_symbol_date_period_key UNIQUE (symbol, date, period);

ALTER TABLE cash_flow_statements
ADD CONSTRAINT cash_flow_statements_symbol_date_period_key UNIQUE (symbol, date, period);

-- Drop old indexes
DROP INDEX IF EXISTS idx_income_statements_symbol_date;
DROP INDEX IF EXISTS idx_balance_sheets_symbol_date;
DROP INDEX IF EXISTS idx_cash_flow_statements_symbol_date;

-- Add new indexes for better query performance with period
CREATE INDEX IF NOT EXISTS idx_income_statements_symbol_period 
ON income_statements(symbol, period);

CREATE INDEX IF NOT EXISTS idx_balance_sheets_symbol_period 
ON balance_sheets(symbol, period);

CREATE INDEX IF NOT EXISTS idx_cash_flow_statements_symbol_period 
ON cash_flow_statements(symbol, period);
