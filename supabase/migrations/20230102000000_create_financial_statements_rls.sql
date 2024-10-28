-- Enable RLS
ALTER TABLE income_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_statements ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to read data
CREATE POLICY "Enable read access for authenticated users"
ON income_statements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON balance_sheets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON cash_flow_statements FOR SELECT
TO authenticated
USING (true);

-- Create policies for service role to insert/update data
CREATE POLICY "Enable insert for service role"
ON income_statements FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable update for service role"
ON income_statements FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable insert for service role"
ON balance_sheets FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable update for service role"
ON balance_sheets FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable insert for service role"
ON cash_flow_statements FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable update for service role"
ON cash_flow_statements FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_income_statements_symbol_date 
ON income_statements(symbol, date);

CREATE INDEX IF NOT EXISTS idx_balance_sheets_symbol_date 
ON balance_sheets(symbol, date);

CREATE INDEX IF NOT EXISTS idx_cash_flow_statements_symbol_date 
ON cash_flow_statements(symbol, date);
