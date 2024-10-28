import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get('code');
  const returnUrl = url.searchParams.get('returnUrl') || '/';

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  throw redirect(303, returnUrl);
};
