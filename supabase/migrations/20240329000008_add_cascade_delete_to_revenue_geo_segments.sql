-- Drop existing foreign key constraints
ALTER TABLE revenue_geo_segments DROP CONSTRAINT revenue_geo_segments_symbol_fkey;
ALTER TABLE balance_sheets DROP CONSTRAINT balance_sheets_symbol_fkey;
ALTER TABLE cash_flow_statements DROP CONSTRAINT cash_flow_statements_symbol_fkey;
ALTER TABLE income_statements DROP CONSTRAINT income_statements_symbol_fkey;
ALTER TABLE revenue_segments DROP CONSTRAINT fk_revenue_segments_stock_metadata;
ALTER TABLE user_stocks DROP CONSTRAINT user_stocks_stock_metadata_id_fkey;

-- Add foreign key constraints with ON DELETE CASCADE
ALTER TABLE revenue_geo_segments
ADD CONSTRAINT revenue_geo_segments_symbol_fkey
FOREIGN KEY (symbol)
REFERENCES stock_metadata(symbol)
ON DELETE CASCADE;

ALTER TABLE balance_sheets
ADD CONSTRAINT balance_sheets_symbol_fkey
FOREIGN KEY (symbol)
REFERENCES stock_metadata(symbol)
ON DELETE CASCADE;

ALTER TABLE cash_flow_statements
ADD CONSTRAINT cash_flow_statements_symbol_fkey
FOREIGN KEY (symbol)
REFERENCES stock_metadata(symbol)
ON DELETE CASCADE;

ALTER TABLE income_statements
ADD CONSTRAINT income_statements_symbol_fkey
FOREIGN KEY (symbol)
REFERENCES stock_metadata(symbol)
ON DELETE CASCADE;

ALTER TABLE revenue_segments
ADD CONSTRAINT fk_revenue_segments_stock_metadata
FOREIGN KEY (symbol)
REFERENCES stock_metadata(symbol)
ON DELETE CASCADE;

ALTER TABLE user_stocks
ADD CONSTRAINT user_stocks_stock_metadata_id_fkey
FOREIGN KEY (stock_metadata_id)
REFERENCES stock_metadata(id)
ON DELETE CASCADE;
