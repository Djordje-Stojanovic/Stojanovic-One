-- Function to get database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS TABLE (
    database_name text,
    size_pretty text,
    size_bytes bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        current_database()::text as database_name,
        pg_size_pretty(pg_database_size(current_database()))::text as size_pretty,
        pg_database_size(current_database()) as size_bytes;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_database_size TO authenticated;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name text,
    size_pretty text,
    size_bytes bigint,
    total_rows bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        t.schemaname || '.' || t.tablename as table_name,
        pg_size_pretty(pg_total_relation_size(t.schemaname || '.' || t.tablename))::text as size_pretty,
        pg_total_relation_size(t.schemaname || '.' || t.tablename) as size_bytes,
        st.n_live_tup::bigint as total_rows
    FROM pg_catalog.pg_tables t
    JOIN pg_catalog.pg_stat_user_tables st ON t.tablename = st.relname
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(t.schemaname || '.' || t.tablename) DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_sizes TO authenticated;
