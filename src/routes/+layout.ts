import { browser } from '$app/environment';
import { supabase } from '$lib/supabaseClient';
import { sessionStore } from '$lib/stores/sessionStore';

export const ssr = false;

// Handle auth state changes
if (browser) {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            sessionStore.set(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            sessionStore.set(session);
        }
    });

    // Initialize session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
        sessionStore.set(session);
    });
}

// This disables SSR for all routes and makes the app fully client-side
export const load = async () => {
    return {};
};
