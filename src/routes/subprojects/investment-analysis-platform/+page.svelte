<script lang="ts">
	import { session } from '$lib/stores/sessionStore';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Watchlist from '$lib/components/Watchlist.svelte';

	let activeSection = 'watchlist';

	function setActiveSection(section: string) {
		activeSection = section;
	}
</script>

<svelte:head>
	<title>Investment Analysis Platform - Stojanovic-One</title>
</svelte:head>

{#if $session === undefined}
	<div class="flex h-screen items-center justify-center">
		<LoadingSpinner size="w-12 h-12" />
	</div>
{:else if $session}
	<div class="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900 lg:flex-row">
		<!-- Sidebar for desktop -->
		<aside class="hidden w-64 bg-white shadow-md dark:bg-gray-800 lg:block">
			<nav class="mt-5 px-2">
				<button
					on:click={() => setActiveSection('watchlist')}
					class="group mb-2 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors {activeSection ===
					'watchlist'
						? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
						: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
					aria-current={activeSection === 'watchlist' ? 'page' : undefined}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-3 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
						<path
							fill-rule="evenodd"
							d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
							clip-rule="evenodd"
						/>
					</svg>
					Watchlist
				</button>
				<button
					on:click={() => setActiveSection('due-diligence')}
					class="group mb-2 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors {activeSection ===
					'due-diligence'
						? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
						: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
					aria-current={activeSection === 'due-diligence' ? 'page' : undefined}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-3 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
							clip-rule="evenodd"
						/>
					</svg>
					Due Diligence
				</button>
				<button
					on:click={() => setActiveSection('decision-lists')}
					class="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors {activeSection ===
					'decision-lists'
						? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
						: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
					aria-current={activeSection === 'decision-lists' ? 'page' : undefined}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-3 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
						<path
							fill-rule="evenodd"
							d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
							clip-rule="evenodd"
						/>
					</svg>
					Decision Lists
				</button>
			</nav>
		</aside>

		<!-- Main content -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<main
				class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-4 dark:bg-gray-900 lg:p-8"
			>
				<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
					Investment Analysis Platform
				</h1>
				<p class="mb-8 text-gray-700 dark:text-gray-300">
					Welcome to your personal Investment Analysis Platform!
				</p>

				{#if activeSection === 'watchlist'}
					<Watchlist />
				{:else if activeSection === 'due-diligence'}
					<h2 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
						Due Diligence
					</h2>
					<p class="text-gray-700 dark:text-gray-300">
						Your due diligence tools and content will go here.
					</p>
				{:else if activeSection === 'decision-lists'}
					<h2 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
						Decision Lists
					</h2>
					<p class="text-gray-700 dark:text-gray-300">Your decision lists will go here.</p>
				{/if}
			</main>

			<!-- Floating navigation bar for mobile -->
			<div class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-800 lg:hidden">
				<div class="flex justify-around">
					<button
						on:click={() => setActiveSection('watchlist')}
						class="flex flex-1 flex-col items-center py-3 {activeSection === 'watchlist'
							? 'text-primary-600 dark:text-primary-400'
							: 'text-gray-500 dark:text-gray-400'}"
						aria-current={activeSection === 'watchlist' ? 'page' : undefined}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
							<path
								fill-rule="evenodd"
								d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="text-xs">Watchlist</span>
					</button>
					<button
						on:click={() => setActiveSection('due-diligence')}
						class="flex flex-1 flex-col items-center py-3 {activeSection === 'due-diligence'
							? 'text-primary-600 dark:text-primary-400'
							: 'text-gray-500 dark:text-gray-400'}"
						aria-current={activeSection === 'due-diligence' ? 'page' : undefined}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="text-xs">Due Diligence</span>
					</button>
					<button
						on:click={() => setActiveSection('decision-lists')}
						class="flex flex-1 flex-col items-center py-3 {activeSection === 'decision-lists'
							? 'text-primary-600 dark:text-primary-400'
							: 'text-gray-500 dark:text-gray-400'}"
						aria-current={activeSection === 'decision-lists' ? 'page' : undefined}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
							<path
								fill-rule="evenodd"
								d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="text-xs">Decisions</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
				Investment Analysis Platform
			</h1>
			<p class="text-xl text-gray-700 dark:text-gray-300">
				Please log in to access the Investment Analysis Platform.
			</p>
		</div>
	</div>
{/if}
