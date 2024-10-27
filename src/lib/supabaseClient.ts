import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For admin operations (if needed)
const privateSupabaseUrl = import.meta.env.PRIVATE_SUPABASE_URL
const privateSupabaseServiceRoleKey = import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = privateSupabaseUrl && privateSupabaseServiceRoleKey
  ? createClient(privateSupabaseUrl, privateSupabaseServiceRoleKey)
  : null
