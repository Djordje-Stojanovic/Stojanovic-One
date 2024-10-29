import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface SessionState {
    session: Session | null;
    isLoading: boolean;
}

const { subscribe, update } = writable<SessionState>({
    session: null,
    isLoading: true
});

export const sessionStore = {
    subscribe,
    set: (session: Session | null) => update(state => ({ ...state, session, isLoading: false })),
    setLoading: (isLoading: boolean) => update(state => ({ ...state, isLoading })),
    refresh: async () => {
        try {
            sessionStore.setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                // Try to refresh the session if we don't have one
                const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
                sessionStore.set(refreshedSession);
            } else {
                sessionStore.set(session);
            }
        } catch (error) {
            console.error('Failed to refresh session:', error);
            sessionStore.set(null);
        }
    }
};

// Initialize session
let initialized = false;
async function initializeSession() {
    if (initialized) return;
    initialized = true;
    await sessionStore.refresh();
}

// Initialize on import
initializeSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
    sessionStore.set(session);
});
