import { supabase } from '$lib/supabaseClient';
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ url }) => {
    // Don't check session for auth-related paths
    if (url.pathname.startsWith('/auth') || 
        url.pathname.startsWith('/login') || 
        url.pathname.startsWith('/register')) {
        return { session: null };
    }

    try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();

        // If we have a session, return it immediately
        if (session) {
            return { session };
        }

        // If we don't have a session, try to refresh it
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        
        // If we got a refreshed session, use it
        if (refreshedSession) {
            return { session: refreshedSession };
        }

        // Only redirect if we're certain there's no valid session
        const returnPath = encodeURIComponent(url.pathname + url.search);
        throw redirect(303, `/login?from=${returnPath}`);

    } catch (error) {
        if (error instanceof Response) throw error; // Rethrow redirect
        console.error('Failed to check session:', error);
        
        // If there's an error checking the session, redirect to login
        const returnPath = encodeURIComponent(url.pathname + url.search);
        throw redirect(303, `/login?from=${returnPath}`);
    }
};
