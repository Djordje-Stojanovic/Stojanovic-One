<script lang="ts">
	import '../app.css';
	import { session } from '$lib/stores/sessionStore';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}
</script>

<nav class="bg-gray-800 p-4 text-white">
	<div class="container mx-auto flex items-center justify-between">
		<a href="/" class="text-xl font-bold">Home</a>
		<div>
			{#if $session}
				<a href="/profile" class="mr-4">Profile</a>
				<button on:click={handleLogout}>Logout</button>
			{:else}
				<a href="/login" class="mr-4">Login</a>
				<a href="/register">Register</a>
			{/if}
		</div>
	</div>
</nav>

<main class="container mx-auto mt-4">
	<slot />
</main>
