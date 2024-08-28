import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const session = writable(undefined);

supabase.auth.getSession().then(({ data: { session } }) => {
	updateSession(session);
});

supabase.auth.onAuthStateChange((_, _session) => {
	updateSession(_session);
});

function updateSession(_session) {
	session.set(_session);
	console.log('Session updated:', _session);
}
