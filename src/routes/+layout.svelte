<script lang="ts">
	import '../app.css';
	import { session } from '$lib/stores/sessionStore';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

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

<nav class="bg-gray-800 p-4 text-white dark:bg-gray-900">
	<div class="container mx-auto flex items-center justify-between">
		<a href="/" class="text-xl font-bold">Home</a>
		<div class="flex items-center">
			<ThemeToggle />
			{#if $session}
				<a href="/profile" class="ml-4 mr-4">Profile</a>
				<button on:click={handleLogout}>Logout</button>
			{:else}
				<a href="/login" class="ml-4 mr-4">Login</a>
				<a href="/register">Register</a>
			{/if}
		</div>
	</div>
</nav>

<main class="container mx-auto mt-4">
	<slot />
</main>
