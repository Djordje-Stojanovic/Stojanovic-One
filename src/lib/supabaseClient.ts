import { createClient } from '@supabase/supabase-js'
import { browser } from '$app/environment'

// Auth client using hosted Supabase
const authUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const authKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

// Database client using VPS Supabase
const dbUrl = 'https://supabase.stojanovic-one.com'
const dbKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTczMjM2NzA0MCwiZXhwIjo0ODg4MDQwNjQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.8ve8LYnij0tpxDl2OcPGnJbsQq5usE2FvCjdTmUGo6Q'

if (!authUrl || !authKey) {
  throw new Error('Missing Supabase auth environment variables')
}

// Custom storage implementation that checks for browser environment
const customStorage = {
  getItem: (key: string) => {
    if (browser) {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (browser) {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string) => {
    if (browser) {
      localStorage.removeItem(key)
    }
  }
}

// Auth client for authentication only
export const supabase = createClient(authUrl, authKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorage
  }
})

// Database client for data operations (using service role key)
export const db = createClient(dbUrl, dbKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      apikey: dbKey,
      // Remove application/vnd.pgrst.object+json from Accept header
      Accept: 'application/json'
    }
  }
})

// Helper to get auth session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Create a new database client with auth token
export const getDbClient = async () => {
  const session = await getSession()
  if (session?.access_token) {
    // Create a new client with the user's access token
    return createClient(dbUrl, dbKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          apikey: dbKey,
          Authorization: `Bearer ${session.access_token}`,
          Accept: 'application/json'
        }
      }
    })
  }
  // Fall back to service role client
  return db
}

type QueryFilter = {
  [key: string]: string | number | boolean | null;
}

// Helper for single-object queries
export const getSingle = async <T>(
  table: string,
  query: QueryFilter,
  options: { client?: typeof db } = {}
): Promise<T | null> => {
  const client = options.client || db
  const { data, error } = await client
    .from(table)
    .select('*')
    .match(query)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    return null
  }

  return data as T
}

// Debug function to test database connection
export const testDbConnection = async () => {
  try {
    console.log('Testing connection to:', dbUrl)
    // Test with a simple query first
    const { data: stocksData, error: stocksError } = await db
      .from('user_stocks')
      .select('*')
      .limit(1)
    
    console.log('Stocks test:', { data: stocksData, error: stocksError })

    const { data: metaData, error: metaError } = await db
      .from('stock_metadata')
      .select('*')
      .limit(1)
    
    console.log('Metadata test:', { data: metaData, error: metaError })

    return { 
      success: !stocksError && !metaError,
      data: { 
        stocks: stocksData,
        metadata: metaData
      }
    }
  } catch (e) {
    console.error('Database connection test failed:', e)
    return { success: false, error: e }
  }
}
