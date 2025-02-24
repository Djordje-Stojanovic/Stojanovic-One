import type { SupabaseClient, Session } from '@supabase/supabase-js';

// Auth client for authentication only
export const supabase: SupabaseClient;

// Database client for data operations (using service role key)
export const db: SupabaseClient;

// Helper to get auth session
export function getSession(): Promise<Session | null>;

// Create a new database client with auth token
export function getDbClient(): Promise<SupabaseClient>;

type QueryFilter = {
  [key: string]: string | number | boolean | null;
};

// Helper for single-object queries
export function getSingle<T>(
  table: string,
  query: QueryFilter,
  options?: { client?: SupabaseClient }
): Promise<T | null>;

// Debug function to test database connection
export function testDbConnection(): Promise<{
  success: boolean;
  data?: {
    stocks: unknown;
    metadata: unknown;
  };
  error?: unknown;
}>;
