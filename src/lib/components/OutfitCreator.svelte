<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { onMount } from 'svelte';
	import type { ClothingItem, Outfit } from '$lib/types';

	let clothingItems: ClothingItem[] = [];
	let selectedOutfit: Partial<Record<string, ClothingItem>> = {};
	let savedOutfits: Outfit[] = [];
	let loading = true;
	let error: string | null = null;
	let outfitName = '';
	let selectedCategory: string | null = null;

	const categories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

	onMount(async () => {
		await loadClothingItems();
		await loadSavedOutfits();
	});

	async function loadClothingItems() {
		try {
			const { data, error: fetchError } = await supabase
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
		} catch (e) {
			console.error('Error fetching clothing items:', e);
			error = e.message;
		} finally {
			loading = false;
		}
	}

	async function getSignedUrl(path: string) {
		const { data, error } = await supabase.storage
			.from('clothing-items')
			.createSignedUrl(path, 3600); // URL valid for 1 hour

		if (error) {
			console.error('Error creating signed URL:', error);
			return null;
		}

		return data.signedUrl;
	}

	async function loadSavedOutfits() {
		try {
			const { data, error: fetchError } = await supabase
				.from('outfits')
				.select('*')
				.eq('user_id', $session.user.id);

			if (fetchError) throw fetchError;

			savedOutfits = data;
		} catch (e) {
			console.error('Error fetching saved outfits:', e);
			error = e.message;
		}
	}

	function selectCategory(category: string) {
		selectedCategory = category;
	}

	function selectItem(item: ClothingItem) {
		if (selectedCategory) {
			selectedOutfit[selectedCategory] = item;
			selectedCategory = null;
		}
	}

	function removeItem(category: string) {
		delete selectedOutfit[category];
		selectedOutfit = selectedOutfit; // Trigger reactivity
	}

	async function saveOutfit() {
		if (!outfitName) {
			alert('Please enter a name for your outfit');
			return;
		}

		const outfitData = {
			user_id: $session.user.id,
			name: outfitName,
			top_id: selectedOutfit['Tops']?.id,
			bottom_id: selectedOutfit['Bottoms']?.id,
			dress_id: selectedOutfit['Dresses']?.id,
			shoes_id: selectedOutfit['Shoes']?.id,
			accessory1_id: selectedOutfit['Accessories']?.id
		};

		try {
			const { data, error } = await supabase.from('outfits').insert(outfitData).select();

			if (error) throw error;

			alert('Outfit saved successfully!');
			outfitName = '';
			await loadSavedOutfits();
		} catch (e) {
			console.error('Error saving outfit:', e);
			alert('Failed to save outfit. Please try again.');
		}
	}

	async function loadOutfit(outfit: Outfit) {
		selectedOutfit = {};
		const categories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
		const idFields = ['top_id', 'bottom_id', 'dress_id', 'shoes_id', 'accessory1_id'];

		for (let i = 0; i < categories.length; i++) {
			const itemId = outfit[idFields[i]];
			if (itemId) {
				const item = clothingItems.find((item) => item.id === itemId);
				if (item) {
					selectedOutfit[categories[i]] = item;
				}
			}
		}

		selectedOutfit = selectedOutfit; // Trigger reactivity
	}
</script>

<div class="space-y-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
	<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create Your Outfit</h2>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
		{#each categories as category}
			<div class="flex flex-col items-center">
				<h3 class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">{category}</h3>
				{#if selectedOutfit[category]}
					<div class="relative">
						<img
							src={selectedOutfit[category].imageUrl}
							alt={selectedOutfit[category].name}
							class="h-32 w-32 rounded-lg object-cover shadow-md"
						/>
						<button
							on:click={() => removeItem(category)}
							class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors duration-200 hover:bg-red-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				{:else}
					<button
						on:click={() => selectCategory(category)}
						class="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors duration-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-2 h-8 w-8 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						<span class="text-sm text-gray-500 dark:text-gray-400">Select {category}</span>
					</button>
				{/if}
			</div>
		{/each}
	</div>

	{#if selectedCategory}
		<div class="mt-6">
			<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
				Select {selectedCategory}
			</h3>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each clothingItems.filter((item) => item.category === selectedCategory) as item (item.id)}
					<button
						on:click={() => selectItem(item)}
						class="flex flex-col items-center rounded-lg border border-gray-200 p-2 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
					>
						<img src={item.imageUrl} alt={item.name} class="h-24 w-24 rounded-md object-cover" />
						<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.name}</p>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="mt-6">
		<input
			type="text"
			placeholder="Enter outfit name"
			bind:value={outfitName}
			class="mb-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<button
			on:click={saveOutfit}
			class="w-full rounded-md bg-primary-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-primary-700"
		>
			Save Outfit
		</button>
	</div>

	<div class="mt-8">
		<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Saved Outfits</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each savedOutfits as outfit (outfit.id)}
				<button
					on:click={() => loadOutfit(outfit)}
					class="rounded-lg border border-gray-200 p-4 text-left shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
				>
					<h3 class="font-semibold text-gray-900 dark:text-white">{outfit.name}</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Click to load</p>
				</button>
			{/each}
		</div>
	</div>
</div>
