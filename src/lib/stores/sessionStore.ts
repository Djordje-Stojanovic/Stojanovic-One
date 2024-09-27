import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export const session = writable<Session | null>(null);

supabase.auth.getSession().then(({ data: { session } }) => {
	updateSession(session);
});

supabase.auth.onAuthStateChange((_, _session) => {
	updateSession(_session);
});

function updateSession(_session: Session | null) {
	session.set(_session);
	console.log('Session updated:', _session);
}
