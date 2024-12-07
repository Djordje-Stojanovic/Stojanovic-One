-- Grant necessary permissions to anon role
GRANT SELECT ON public.stock_prices TO anon;
GRANT INSERT ON public.stock_prices TO anon;
GRANT SELECT ON public.stock_prices TO authenticated;
GRANT ALL ON public.stock_prices TO service_role;
GRANT USAGE ON SEQUENCE public.stock_prices_id_seq TO anon;
GRANT ALL ON SEQUENCE public.stock_prices_id_seq TO service_role;

-- Enable RLS
ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anon users to read stock prices" ON public.stock_prices;
DROP POLICY IF EXISTS "Allow anon users to insert stock prices" ON public.stock_prices;
DROP POLICY IF EXISTS "Allow authenticated users to read stock prices" ON public.stock_prices;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock prices" ON public.stock_prices;
DROP POLICY IF EXISTS "Allow authenticated users to update stock prices" ON public.stock_prices;
DROP POLICY IF EXISTS "Allow authenticated users to delete stock prices" ON public.stock_prices;

-- Create RLS policies
CREATE POLICY "Allow anon users to read stock prices" ON public.stock_prices
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anon users to insert stock prices" ON public.stock_prices
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read stock prices" ON public.stock_prices
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert stock prices" ON public.stock_prices
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update stock prices" ON public.stock_prices
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete stock prices" ON public.stock_prices
FOR DELETE
TO authenticated
USING (true);

-- Reload schema to apply changes
SELECT reload_schema();
