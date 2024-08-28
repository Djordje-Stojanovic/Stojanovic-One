<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { onMount } from 'svelte';

	let watchlistItems = [];
	let loading = true;

	let sortField = 'symbol';
	let sortDirection = 'asc';
	let filterText = '';

	$: sortedAndFilteredItems = watchlistItems
		.filter(
			(item) =>
				item.symbol.toLowerCase().includes(filterText.toLowerCase()) ||
				item.company_name.toLowerCase().includes(filterText.toLowerCase()) ||
				item.sector.toLowerCase().includes(filterText.toLowerCase())
		)
		.sort((a, b) => {
			if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
			if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

	onMount(async () => {
		if ($session) {
			await fetchWatchlistItems();
		}
	});

	async function fetchWatchlistItems() {
		const { data, error } = await supabase
			.from('watchlist_items')
			.select('*')
			.eq('user_id', $session.user.id);

		if (error) {
			console.error('Error fetching watchlist items:', error);
		} else {
			watchlistItems = data;
		}
		loading = false;
	}

	async function moveToDD(item) {
		const { data, error } = await supabase
			.from('due_diligence_items')
			.insert({
				user_id: $session.user.id,
				watchlist_item_id: item.id,
				symbol: item.symbol,
				company_name: item.company_name,
				sector: item.sector,
				current_price: item.current_price,
				target_price: item.target_price,
				notes: item.notes,
				checklist: {}
			})
			.select();

		if (error) {
			console.error('Error moving item to Due Diligence:', error);
		} else {
			watchlistItems = watchlistItems.filter((i) => i.id !== item.id);
			await supabase.from('watchlist_items').delete().eq('id', item.id);
		}
	}

	async function deleteStock(item) {
		if (confirm(`Are you sure you want to delete ${item.symbol} from your watchlist?`)) {
			const { error } = await supabase.from('watchlist_items').delete().eq('id', item.id);

			if (error) {
				console.error('Error deleting stock:', error);
			} else {
				watchlistItems = watchlistItems.filter((i) => i.id !== item.id);
			}
		}
	}

	function toggleSort(field) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
	}

	export function addStock(newStock) {
		watchlistItems = [newStock, ...watchlistItems];
	}
</script>

<div class="mb-4">
	<input
		type="text"
		placeholder="Filter stocks..."
		bind:value={filterText}
		class="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
	/>
</div>

<div class="mb-4 flex space-x-2">
	<button on:click={() => toggleSort('symbol')} class="text-sm font-medium">
		Symbol {sortField === 'symbol' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
	</button>
	<button on:click={() => toggleSort('company_name')} class="text-sm font-medium">
		Company {sortField === 'company_name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
	</button>
	<button on:click={() => toggleSort('current_price')} class="text-sm font-medium">
		Price {sortField === 'current_price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
	</button>
</div>

{#if loading}
	<p>Loading watchlist items...</p>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedAndFilteredItems as item (item.id)}
			<div class="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">{item.symbol}</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">{item.company_name}</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">Sector: {item.sector}</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">Current Price: ${item.current_price}</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">Target Price: ${item.target_price}</p>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.notes}</p>
				<div class="mt-4 flex justify-between">
					<button
						on:click={() => moveToDD(item)}
						class="rounded bg-secondary-600 px-3 py-1 text-sm text-white transition-colors hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600"
					>
						Move to Due Diligence
					</button>
					<button
						on:click={() => deleteStock(item)}
						class="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
					>
						Delete
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
