<script lang="ts">
	import '../app.css';
	import { session } from '$lib/stores/sessionStore';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let isMenuOpen = false;

	onMount(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			$session = session;
			if (session) goto('/');
		});

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			$session = session;
			if (session) goto('/');
		});

		return () => subscription.unsubscribe();
	});

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<nav class="bg-secondary-800 p-4 text-secondary-100">
	<div class="container mx-auto flex items-center justify-between">
		<a href="/" class="text-xl font-bold">Home</a>
		<div class="hidden items-center space-x-4 md:flex">
			<ThemeToggle />
			{#if $session}
				<a href="/profile" class="hover:text-primary-300">Profile</a>
				<button on:click={handleLogout} class="hover:text-primary-300">Logout</button>
			{:else}
				<a href="/login" class="hover:text-primary-300">Login</a>
				<a href="/register" class="hover:text-primary-300">Register</a>
			{/if}
		</div>
		<button class="md:hidden" on:click={toggleMenu}>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16m-7 6h7"
				/>
			</svg>
		</button>
	</div>
</nav>

{#if isMenuOpen}
	<div class="bg-secondary-800 p-4 text-secondary-100 md:hidden">
		<ThemeToggle />
		{#if $session}
			<a href="/profile" class="block py-2 hover:text-primary-300">Profile</a>
			<button on:click={handleLogout} class="block w-full py-2 text-left hover:text-primary-300"
				>Logout</button
			>
		{:else}
			<a href="/login" class="block py-2 hover:text-primary-300">Login</a>
			<a href="/register" class="block py-2 hover:text-primary-300">Register</a>
		{/if}
	</div>
{/if}

<main class="container mx-auto mt-4 px-4">
	<slot />
</main>
