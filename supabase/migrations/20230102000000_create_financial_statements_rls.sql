-- Enable RLS on the tables
ALTER TABLE income_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_statements ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to select data
CREATE POLICY "Allow select for authenticated users" ON income_statements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow select for authenticated users" ON balance_sheets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow select for authenticated users" ON cash_flow_statements FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy to allow service role to insert and update data
CREATE POLICY "Allow insert and update for service role" ON income_statements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow insert and update for service role" ON balance_sheets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow insert and update for service role" ON cash_flow_statements FOR ALL USING (auth.role() = 'service_role');

-- Grant usage on the sequences to authenticated users
GRANT USAGE, SELECT ON SEQUENCE income_statements_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE balance_sheets_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cash_flow_statements_id_seq TO authenticated;

-- Grant select permissions to authenticated users
GRANT SELECT ON income_statements TO authenticated;
GRANT SELECT ON balance_sheets TO authenticated;
GRANT SELECT ON cash_flow_statements TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON income_statements TO service_role;
GRANT ALL ON balance_sheets TO service_role;
GRANT ALL ON cash_flow_statements TO service_role;
