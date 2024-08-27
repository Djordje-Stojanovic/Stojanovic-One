<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let email = '';
	let password = '';
	let errorMessage = '';

	let redirectedFrom = '';
	$: {
		const params = $page.url.searchParams;
		redirectedFrom = params.get('from') || '';
	}

	async function handleLogin() {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			errorMessage = error.message;
		} else {
			goto('/');
		}
	}

	const signInWithGoogle = () => {
		return supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`
			}
		});
	};
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8"
>
	<div class="w-full max-w-md space-y-8">
		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
			Sign in to your account
		</h2>
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
						class="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
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
						class="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
						placeholder="Password"
					/>
				</div>
			</div>

			{#if errorMessage}
				<p class="mt-2 text-center text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
			{/if}

			<div>
				<button
					type="submit"
					class="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
				>
					Sign in
				</button>
			</div>
		</form>
		<div class="mt-4 text-center">
			<a
				href="/register"
				class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
			>
				Don't have an account? Register
			</a>
		</div>
		<div class="mt-4">
			<button
				on:click={() => signInWithGoogle()}
				class="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
			>
				<img src="/google-logo.svg" alt="Google logo" class="h-5 w-5" />
				<span>Sign in with Google</span>
			</button>
		</div>
	</div>
</div>
