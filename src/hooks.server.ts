import type { Handle } from '@sveltejs/kit';
import type { Session } from '@supabase/supabase-js';

// Extend the Locals interface to include the session property
declare module '@sveltejs/kit' {
  interface Locals {
    session: Session | null;
  }
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

  // Your existing authentication logic
  const session = (event.locals as { session?: Session | null }).session;

  if (!session?.user && event.url.pathname !== '/login') {
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?redirected=true&from=${event.url.pathname}`
      }
    });
  }

  return resolve(event);
};
