-- First, remove any duplicate stocks by symbol
WITH duplicates AS (
  SELECT us.id
  FROM user_stocks us
  JOIN stock_metadata sm ON us.stock_metadata_id = sm.id
  WHERE EXISTS (
    SELECT 1
    FROM user_stocks us2
    JOIN stock_metadata sm2 ON us2.stock_metadata_id = sm2.id
    WHERE us2.user_id = us.user_id
    AND sm2.symbol = sm.symbol
    AND us2.id < us.id
  )
)
DELETE FROM user_stocks
WHERE id IN (SELECT id FROM duplicates);

-- Drop existing constraint if it exists
ALTER TABLE user_stocks
DROP CONSTRAINT IF EXISTS user_stocks_user_id_stock_metadata_id_list_name_unique;

-- Create a function to check for duplicate symbols
CREATE OR REPLACE FUNCTION check_stock_symbol_unique() 
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM user_stocks us
    JOIN stock_metadata sm ON us.stock_metadata_id = sm.id
    JOIN stock_metadata new_sm ON NEW.stock_metadata_id = new_sm.id
    WHERE us.user_id = NEW.user_id
    AND sm.symbol = new_sm.symbol
    AND us.id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Stock symbol already exists in another list'
      USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS check_stock_symbol_unique_trigger ON user_stocks;

-- Create trigger
CREATE TRIGGER check_stock_symbol_unique_trigger
BEFORE INSERT OR UPDATE ON user_stocks
FOR EACH ROW
EXECUTE FUNCTION check_stock_symbol_unique();

-- Add comment explaining the trigger
COMMENT ON TRIGGER check_stock_symbol_unique_trigger ON user_stocks 
IS 'Ensures a user cannot have the same stock symbol in multiple lists';
