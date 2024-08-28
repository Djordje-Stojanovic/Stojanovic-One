<script lang="ts">
	import { session } from '$lib/stores/sessionStore';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Watchlist from '$lib/components/Watchlist.svelte';
	import DueDiligence from '$lib/components/DueDiligence.svelte';
	import BuyReady from '$lib/components/BuyReady.svelte';
	import TooExpensive from '$lib/components/TooExpensive.svelte';
	import PassForNow from '$lib/components/PassForNow.svelte';
	import PermanentPass from '$lib/components/PermanentPass.svelte';
	import CoreHoldings from '$lib/components/CoreHoldings.svelte';
	import RegularReview from '$lib/components/RegularReview.svelte';
	import SellReady from '$lib/components/SellReady.svelte';
	import Sold from '$lib/components/Sold.svelte';
	import AddStockForm from '$lib/components/AddStockForm.svelte';

	let activeSection = 'watchlist';
	let watchlistComponent;
	let showAddForm = false;

	function setActiveSection(section: string) {
		activeSection = section;
	}

	function toggleAddForm() {
		showAddForm = !showAddForm;
	}

	function handleStockAdded(event) {
		if (watchlistComponent) {
			watchlistComponent.addStock(event.detail);
		}
		showAddForm = false;
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
			<nav class="space-y-1">
				{#each ['watchlist', 'due-diligence', 'buy-ready', 'too-expensive', 'pass-for-now', 'permanent-pass', 'core-holdings', 'regular-review', 'sell-ready', 'sold'] as section}
					<button
						on:click={() => setActiveSection(section)}
						class="group mb-2 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors {activeSection ===
						section
							? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
							: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
						aria-current={activeSection === section ? 'page' : undefined}
					>
						{section.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
					</button>
				{/each}
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
				{#if activeSection === 'watchlist'}
					<div class="mb-4 flex justify-between">
						<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Watchlist</h2>
						<button
							on:click={toggleAddForm}
							class="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
						>
							{showAddForm ? 'Cancel' : 'Add New Stock'}
						</button>
					</div>
					{#if showAddForm}
						<AddStockForm on:stockAdded={handleStockAdded} />
					{/if}
					<Watchlist bind:this={watchlistComponent} />
				{:else if activeSection === 'due-diligence'}
					<DueDiligence />
				{:else if activeSection === 'buy-ready'}
					<BuyReady />
				{:else if activeSection === 'too-expensive'}
					<TooExpensive />
				{:else if activeSection === 'pass-for-now'}
					<PassForNow />
				{:else if activeSection === 'permanent-pass'}
					<PermanentPass />
				{:else if activeSection === 'core-holdings'}
					<CoreHoldings />
				{:else if activeSection === 'regular-review'}
					<RegularReview />
				{:else if activeSection === 'sell-ready'}
					<SellReady />
				{:else if activeSection === 'sold'}
					<Sold />
				{/if}
			</main>

			<!-- Floating navigation bar for mobile -->
			<div class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-800 lg:hidden">
				<div class="flex justify-around">
					{#each ['watchlist', 'due-diligence', 'buy-ready', 'too-expensive', 'pass-for-now', 'permanent-pass', 'core-holdings', 'regular-review', 'sell-ready', 'sold'] as section}
						<button
							on:click={() => setActiveSection(section)}
							class="flex flex-1 flex-col items-center py-3 {activeSection === section
								? 'text-primary-600 dark:text-primary-400'
								: 'text-gray-500 dark:text-gray-400'}"
							aria-current={activeSection === section ? 'page' : undefined}
						>
							{section.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
						</button>
					{/each}
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
