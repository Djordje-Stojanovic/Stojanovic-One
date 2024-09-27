<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { onMount } from 'svelte';
	import { session } from '$lib/stores/sessionStore';

	let email = '';
	let password = '';
	let errorMessage = '';
	let loading = false;

	let redirectedFrom = '';
	$: {
		const params = $page.url.searchParams;
		redirectedFrom = params.get('from') || '';
	}

	onMount(() => {
		if ($session) {
			const from = new URLSearchParams(window.location.search).get('from') || '/';
			goto(from);
		}
	});

	async function handleLogin() {
		loading = true;
		errorMessage = '';
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			errorMessage = error.message;
		} else {
			goto('/');
		}
		loading = false;
	}

	const signInWithGoogle = () => {
		const redirectTo = import.meta.env.DEV
			? 'http://localhost:5173/auth/callback'
			: 'https://stojanovic-one.vercel.app/auth/callback';
		return supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo }
		});
	};
</script>

<div
	class="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12 dark:bg-secondary-900 sm:px-6 lg:px-8"
>
	<div class="w-full max-w-md space-y-8">
		<h2 class="mt-6 text-center text-3xl font-extrabold">Sign in to your account</h2>
		{#if $page.url.searchParams.get('redirected') === 'true'}
			<div class="mb-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900">
				<p class="text-sm text-yellow-700 dark:text-yellow-200">
					You've been redirected to the login page. Please log in to access {redirectedFrom ||
						'the requested page'}.
				</p>
			</div>
		{/if}
		<form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
			<input type="hidden" name="remember" value="true" />
			<div class="-space-y-px rounded-md shadow-sm">
				<div>
					<label for="email-address" class="sr-only">Email address</label>
					<input
						id="email-address"
						name="email"
						type="email"
						required
						bind:value={email}
						class="input-field relative block w-full rounded-t-md"
						placeholder="Email address"
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						bind:value={password}
						class="input-field relative block w-full rounded-b-md"
						placeholder="Password"
					/>
				</div>
			</div>

			{#if errorMessage}
				<ErrorMessage message={errorMessage} />
			{/if}

			<div>
				<button
					type="submit"
					class="btn-primary group relative flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium"
					disabled={loading}
				>
					{#if loading}
						<LoadingSpinner size="w-5 h-5" />
					{:else}
						Sign in
					{/if}
				</button>
			</div>
		</form>
		<div class="mt-4 text-center">
			<a
				href="/register"
				class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
			>
				Don't have an account? Register
			</a>
		</div>
		<div class="mt-4">
			<button
				on:click={() => signInWithGoogle()}
				class="btn-secondary flex w-full items-center justify-center space-x-2 rounded-md px-4 py-2 text-sm font-medium"
			>
				<img src="/google-logo.svg" alt="Google logo" class="h-5 w-5" />
				<span>Sign in with Google</span>
			</button>
		</div>
	</div>
</div>
