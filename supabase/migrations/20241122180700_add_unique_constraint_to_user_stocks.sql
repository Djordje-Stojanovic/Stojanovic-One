ALTER TABLE user_stocks ADD CONSTRAINT unique_user_stock_entry UNIQUE (user_id, stock_metadata_id, list_name);
