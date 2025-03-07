-- Add pe_ratio column to stock_metadata table
ALTER TABLE stock_metadata ADD COLUMN IF NOT EXISTS pe_ratio numeric;

-- Reload schema to apply changes
SELECT reload_schema();
