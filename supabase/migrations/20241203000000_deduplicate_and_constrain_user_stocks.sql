-- First, remove any duplicate stocks in the same list
WITH duplicates AS (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, stock_metadata_id, list_name ORDER BY created_at) as rn
    FROM user_stocks
  ) t
  WHERE rn > 1
)
DELETE FROM user_stocks
WHERE id IN (SELECT id FROM duplicates);

-- Add unique constraint to prevent future duplicates
ALTER TABLE user_stocks
ADD CONSTRAINT user_stocks_user_id_stock_metadata_id_list_name_unique 
UNIQUE (user_id, stock_metadata_id, list_name);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT user_stocks_user_id_stock_metadata_id_list_name_unique ON user_stocks 
IS 'Ensures a user cannot have the same stock in the same list multiple times';
