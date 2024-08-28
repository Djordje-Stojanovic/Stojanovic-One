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
	let selectedCategories: string[] = [];
	let searchQuery = '';

	const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

	onMount(async () => {
		await loadItems();
	});

	async function getSignedUrl(path: string) {
		const { data, error } = await supabase.storage
			.from('clothing-items')
			.createSignedUrl(path, 7200); // URL valid for 2 hours

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

	function toggleCategory(category: string) {
		if (category === 'All') {
			selectedCategories = selectedCategories.length === categories.length ? [] : [...categories];
		} else {
			selectedCategories = selectedCategories.includes(category)
				? selectedCategories.filter((c) => c !== category)
				: [...selectedCategories, category];
		}
		filterItems();
	}

	function clearFilters() {
		selectedCategories = [];
		searchQuery = '';
		filterItems();
	}

	function filterItems() {
		filteredItems = clothingItems.filter((item) => {
			const categoryMatch =
				selectedCategories.length === 0 ||
				selectedCategories.includes(item.category) ||
				selectedCategories.includes('All');
			const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
			return categoryMatch && searchMatch;
		});

		if (filteredItems.length === 0 && (selectedCategories.length > 0 || searchQuery)) {
			selectedCategories = [];
			searchQuery = '';
			filteredItems = clothingItems;
		}
	}

	async function deleteItem(id: string, imagePath: string) {
		if (confirm('Are you sure you want to delete this item?')) {
			try {
				// Delete the item from the clothing_items table
				const { error: dbError } = await supabase.from('clothing_items').delete().eq('id', id);

				if (dbError) throw dbError;

				// Delete the image from storage
				const { error: storageError } = await supabase.storage
					.from('clothing-items')
					.remove([imagePath]);

				if (storageError) throw storageError;

				// Refresh the items list
				await loadItems();
			} catch (error) {
				console.error('Error deleting item:', error);
				alert('Failed to delete item. Please try again.');
			}
		}
	}

	$: {
		if (clothingItems.length > 0) {
			filterItems();
		}
	}
</script>

<div class="space-y-6 bg-white p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
	<div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
		<input
			type="text"
			bind:value={searchQuery}
			on:input={filterItems}
			placeholder="Search items..."
			class="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
		/>
		<div class="flex flex-wrap gap-2">
			{#each categories as category}
				<button
					class="rounded-full px-3 py-1 text-sm transition-colors duration-200 {selectedCategories.includes(
						category
					)
						? 'bg-primary-500 text-white'
						: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
					on:click={() => toggleCategory(category)}
				>
					{category}
				</button>
			{/each}
		</div>
		<button
			on:click={clearFilters}
			class="rounded-full bg-secondary-500 px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-secondary-600"
		>
			Clear Filters
		</button>
	</div>

	{#if loading}
		<LoadingSpinner />
	{:else if error}
		<p class="text-red-500">{error}</p>
	{:else if filteredItems.length === 0}
		<p class="text-center text-gray-400">No clothing items found. Start by uploading some items!</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each filteredItems as item (item.id)}
				<div
					class="relative overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-105 dark:bg-gray-800"
				>
					<img
						src={item.imageUrl}
						alt={item.name}
						class="h-48 w-full object-cover"
						on:error={(e) => {
							console.error(`Failed to load image: ${item.image_path}`);
							e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
						}}
					/>
					<div class="p-4">
						<h3 class="mb-1 text-lg font-semibold text-gray-100">{item.name}</h3>
						<p class="text-sm text-gray-400">{item.category}</p>
					</div>
					<button
						on:click={() => deleteItem(item.id, item.image_path)}
						class="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-75 transition-opacity hover:bg-red-600 hover:opacity-100"
						title="Delete item"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
