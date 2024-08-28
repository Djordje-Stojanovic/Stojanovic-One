<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import LoadingSpinner from './LoadingSpinner.svelte';

	export let refreshData: () => Promise<void>;

	let clothingItems = [];
	let filteredItems = [];
	let loading = true;
	let error = null;
	let selectedCategory = 'All';
	let searchQuery = '';

	const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

	onMount(async () => {
		await loadItems();
	});

	async function getSignedUrl(path: string) {
		const { data, error } = await supabase.storage
			.from('clothing-items')
			.createSignedUrl(path, 7200); // URL valid for 1 hour

		if (error) {
			console.error('Error creating signed URL:', error);
			return null;
		}

		return data.signedUrl;
	}

	async function loadItems() {
		loading = true;
		error = null;
		try {
			let { data, error: fetchError } = await supabase
				.from('clothing_items')
				.select('*')
				.eq('user_id', $session.user.id);

			if (fetchError) throw fetchError;

			clothingItems = await Promise.all(
				data.map(async (item) => ({
					...item,
					imageUrl: await getSignedUrl(item.image_path)
				}))
			);
			filteredItems = clothingItems;
			console.log('Fetched clothing items:', clothingItems);
		} catch (e) {
			console.error('Error fetching clothing items:', e);
			error = e.message;
		} finally {
			loading = false;
		}
	}

	refreshData = async () => {
		loading = true;
		await loadItems();
	};

	function filterItems() {
		filteredItems = clothingItems.filter((item) => {
			const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
			const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
			return categoryMatch && searchMatch;
		});
	}

	$: {
		if (clothingItems.length > 0) {
			filterItems();
		}
	}
</script>

{#if loading}
	<LoadingSpinner />
{:else if error}
	<p class="text-red-500">{error}</p>
{:else if filteredItems.length === 0}
	<p class="text-center text-secondary-700 dark:text-secondary-200">
		No clothing items found. Start by uploading some items!
	</p>
{:else}
	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			on:input={filterItems}
			placeholder="Search items..."
			class="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
		/>
	</div>
	<div class="mb-4 flex flex-wrap gap-2">
		{#each categories as category}
			<button
				class="rounded-full px-3 py-1 text-sm {selectedCategory === category
					? 'bg-primary-500 text-white'
					: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}"
				on:click={() => {
					selectedCategory = category;
					filterItems();
				}}
			>
				{category}
			</button>
		{/each}
	</div>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each filteredItems as item (item.id)}
			<div class="rounded-lg bg-white p-2 shadow-md dark:bg-gray-800">
				<img
					src={item.imageUrl}
					alt={item.name}
					class="h-40 w-full object-cover"
					on:error={(e) => {
						console.error(`Failed to load image: ${item.image_path}`);
						e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
					}}
				/>
				<p class="mt-2 text-sm font-semibold">{item.name}</p>
				<p class="text-xs text-gray-500">{item.category}</p>
			</div>
		{/each}
	</div>
{/if}
