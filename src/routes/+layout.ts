import { supabase } from '$lib/supabaseClient';
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ url }) => {
	const { data: { session } } = await supabase.auth.getSession();

	if (!session && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/register')) {
		throw redirect(303, `/login?redirected=true&from=${url.pathname}`);
	}

	return {
		session
	};
};