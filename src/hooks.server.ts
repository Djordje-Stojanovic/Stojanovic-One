import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY must be set');
}

export const handle: Handle = async ({ event, resolve }) => {
  // Allow public access to the PDF worker file and PDF content
  if (event.url.pathname.endsWith('.pdf') || event.url.pathname.endsWith('/pdf.worker.min.mjs')) {
    const response = await resolve(event);
    return new Response(response.body, {
      ...response,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    event.locals.session = session;
  } catch (error) {
    console.error('Error getting session:', error);
    event.locals.session = null;
  }

  // For API routes, always return JSON response
  if (event.url.pathname.startsWith('/api/')) {
    if (!event.locals.session?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    return resolve(event);
  }

  // For non-API routes that require auth (except login), redirect to login
  if (!event.locals.session?.user && 
      !event.url.pathname.startsWith('/api/') && 
      event.url.pathname !== '/login' &&
      event.url.pathname !== '/register' &&
      !event.url.pathname.startsWith('/auth/')) {
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?redirected=true&from=${event.url.pathname}`
      }
    });
  }

  return resolve(event);
};
