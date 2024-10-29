import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';

export const GET: RequestHandler = async ({ url }) => {
    const code = url.searchParams.get('code');
    const returnUrl = url.searchParams.get('returnUrl') || url.searchParams.get('from') || '/';

    if (code) {
        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            
            // Ensure we have a valid session
            if (!data?.session) {
                throw new Error('No session established');
            }

            // Add a longer delay to ensure session is properly established
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Auth callback error:', error);
            throw redirect(303, '/login?error=auth_failed');
        }
    }

    // Add state parameter to prevent redirect loops
    const hasParams = returnUrl.includes('?');
    const stateParam = `${hasParams ? '&' : '?'}state=post_auth`;
    throw redirect(303, returnUrl + stateParam);
};
