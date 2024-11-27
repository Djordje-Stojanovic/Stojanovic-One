-- Grant permissions to authenticated users
GRANT SELECT ON revenue_geo_segments TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON revenue_geo_segments TO service_role;

-- Grant usage on the sequence to service role
GRANT USAGE, SELECT ON SEQUENCE revenue_geo_segments_id_seq TO service_role;
