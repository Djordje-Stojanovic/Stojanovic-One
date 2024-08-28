<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { onMount } from 'svelte';

	let watchlists = [];
	let loading = true;

	const colorClasses = [
		'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700',
		'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700',
		'bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700',
		'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700',
		'bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700'
	];

	onMount(async () => {
		if ($session) {
			const { data, error } = await supabase
				.from('watchlists')
				.select('*')
				.eq('user_id', $session.user.id);

			if (error) {
				console.error('Error fetching watchlists:', error);
			} else {
				watchlists = data;
			}
			loading = false;
		}
	});

	function viewWatchlistDetails(watchlistId: string) {
		// Implement view details functionality
		console.log('View details for watchlist:', watchlistId);
	}

	async function createNewWatchlist() {
		const { data, error } = await supabase
			.from('watchlists')
			.insert({ name: 'New Watchlist', description: 'A new watchlist', user_id: $session.user.id })
			.select();

		if (error) {
			console.error('Error creating new watchlist:', error);
		} else {
			watchlists = [...watchlists, data[0]];
		}
	}
</script>

<h2 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Watchlists</h2>
<div class="mb-4">
	<button
		on:click={createNewWatchlist}
		class="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
	>
		Create New Watchlist
	</button>
</div>
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each watchlists as watchlist, index}
		<div
			class="rounded-lg border p-4 shadow-sm transition-all hover:shadow-md {colorClasses[
				index % colorClasses.length
			]}"
		>
			<h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
				{watchlist.name}
			</h3>
			<p class="text-sm text-gray-600 dark:text-gray-400">{watchlist.description}</p>
			<button
				on:click={() => viewWatchlistDetails(watchlist.id)}
				class="mt-2 rounded bg-primary-600 px-3 py-1 text-sm text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
			>
				View Details
			</button>
		</div>
	{/each}
</div>
