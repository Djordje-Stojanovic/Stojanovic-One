import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY must be set');
}

// Create a single Supabase client instance
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export const handle: Handle = async ({ event, resolve }) => {
  // Get the token from the Authorization header
  const token = event.request.headers.get('Authorization')?.split(' ')[1];
  
  if (token) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) {
      event.locals.session = {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: '',
        user
      };
    }
  }

  // For API routes, ensure authentication
  if (event.url.pathname.startsWith('/api/')) {
    if (!event.locals.session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  const response = await resolve(event);
  return response;
};
