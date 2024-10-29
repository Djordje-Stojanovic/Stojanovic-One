import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface SessionState {
    session: Session | null;
    isLoading: boolean;
}

const sessionState = writable<SessionState>({
    session: null,
    isLoading: true
});

const { subscribe, update } = sessionState;

// Create a derived store that only exposes the session
export const session = derived<typeof sessionState, Session | null>(
    sessionState,
    $state => $state.session
);

export const sessionStore = {
    subscribe,
    set: (session: Session | null) => update(state => ({ ...state, session, isLoading: false })),
    setLoading: (isLoading: boolean) => update(state => ({ ...state, isLoading })),
    refresh: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            sessionStore.set(session);
        } catch (error) {
            console.error('Failed to refresh session:', error);
            sessionStore.set(null);
        }
    }
};

// Initialize
supabase.auth.getSession().then(({ data: { session } }) => {
    sessionStore.set(session);
});

supabase.auth.onAuthStateChange((_, session) => {
    sessionStore.set(session);
});
