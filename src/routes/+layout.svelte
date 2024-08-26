<script lang="ts">
	import '../app.css';
	import { session } from '$lib/stores/sessionStore';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	onMount(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			$session = session;
		});

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			$session = session;
		});

		return () => subscription.unsubscribe();
	});
</script>

<slot />
