<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { onMount } from 'svelte';
	import type { ClothingItem, Outfit } from '$lib/types';

	let clothingItems: ClothingItem[] = [];
	let selectedOutfit: Partial<Record<string, ClothingItem[]>> = {};
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
			if (!selectedOutfit[selectedCategory]) {
				selectedOutfit[selectedCategory] = [];
			}
			if (selectedCategory === 'Accessories') {
				if (selectedOutfit[selectedCategory].length < 3) {
					selectedOutfit[selectedCategory] = [...selectedOutfit[selectedCategory], item];
				}
			} else {
				selectedOutfit[selectedCategory] = [item];
			}
			selectedOutfit = selectedOutfit; // Trigger reactivity
			if (selectedCategory !== 'Accessories' || selectedOutfit[selectedCategory].length === 3) {
				selectedCategory = null;
			}
		}
	}

	function removeItem(category: string, index: number) {
		if (selectedOutfit[category]) {
			selectedOutfit[category].splice(index, 1);
			if (selectedOutfit[category].length === 0) {
				delete selectedOutfit[category];
			}
			selectedOutfit = selectedOutfit; // Trigger reactivity
		}
	}

	async function saveOutfit() {
		if (!outfitName) {
			alert('Please enter a name for your outfit');
			return;
		}

		const outfitData = {
			user_id: $session.user.id,
			name: outfitName,
			top_id: selectedOutfit['Tops']?.[0]?.id,
			bottom_id: selectedOutfit['Bottoms']?.[0]?.id,
			dress_id: selectedOutfit['Dresses']?.[0]?.id,
			shoes_id: selectedOutfit['Shoes']?.[0]?.id,
			accessory1_id: selectedOutfit['Accessories']?.[0]?.id,
			accessory2_id: selectedOutfit['Accessories']?.[1]?.id,
			accessory3_id: selectedOutfit['Accessories']?.[2]?.id
		};

		try {
			const { data, error } = await supabase.from('outfits').insert(outfitData).select();

			if (error) throw error;

			alert('Outfit saved successfully!');
			outfitName = '';
			selectedOutfit = {};
			await loadSavedOutfits();
		} catch (e) {
			console.error('Error saving outfit:', e);
			alert('Failed to save outfit. Please try again.');
		}
	}

	async function loadOutfit(outfit: Outfit) {
		selectedOutfit = {};
		const categories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
		const idFields = [
			'top_id',
			'bottom_id',
			'dress_id',
			'shoes_id',
			'accessory1_id',
			'accessory2_id',
			'accessory3_id'
		];

		for (let i = 0; i < categories.length; i++) {
			const category = categories[i];
			if (category === 'Accessories') {
				selectedOutfit[category] = [];
				for (let j = 0; j < 3; j++) {
					const itemId = outfit[idFields[i + j]];
					if (itemId) {
						const item = clothingItems.find((item) => item.id === itemId);
						if (item) {
							selectedOutfit[category].push(item);
						}
					}
				}
			} else {
				const itemId = outfit[idFields[i]];
				if (itemId) {
					const item = clothingItems.find((item) => item.id === itemId);
					if (item) {
						selectedOutfit[category] = [item];
					}
				}
			}
		}

		selectedOutfit = selectedOutfit; // Trigger reactivity
	}

	async function deleteOutfit(outfitId: string) {
		if (confirm('Are you sure you want to delete this outfit?')) {
			try {
				const { error } = await supabase.from('outfits').delete().eq('id', outfitId);

				if (error) throw error;

				await loadSavedOutfits();
			} catch (e) {
				console.error('Error deleting outfit:', e);
				alert('Failed to delete outfit. Please try again.');
			}
		}
	}
</script>

<div class="space-y-6 bg-white p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
	<h2 class="mb-4 text-2xl font-bold">Outfit Creator</h2>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
		{#each categories as category}
			<div class="flex flex-col items-center">
				<h3 class="mb-2 text-lg font-semibold">{category}</h3>
				{#if selectedOutfit[category] && selectedOutfit[category].length > 0}
					<div class="relative flex flex-wrap justify-center gap-2">
						{#each selectedOutfit[category] as item, index}
							<div class="relative">
								<img
									src={item.imageUrl}
									alt={item.name}
									class="h-24 w-24 rounded-lg object-cover shadow-md"
								/>
								<button
									on:click={() => removeItem(category, index)}
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
						{/each}
					</div>
				{/if}
				{#if category === 'Accessories' && (!selectedOutfit[category] || selectedOutfit[category].length < 3)}
					<button
						on:click={() => selectCategory(category)}
						class="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 p-2 text-center transition-colors duration-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-1 h-8 w-8 text-gray-400"
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
						<span class="text-xs text-gray-400">Add {category}</span>
					</button>
				{:else if !selectedOutfit[category] || selectedOutfit[category].length === 0}
					<button
						on:click={() => selectCategory(category)}
						class="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 p-2 text-center transition-colors duration-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-1 h-8 w-8 text-gray-400"
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
						<span class="text-xs text-gray-400">Select {category}</span>
					</button>
				{/if}
			</div>
		{/each}
	</div>

	{#if selectedCategory}
		<div class="mt-6">
			<h3 class="mb-4 text-xl font-semibold">
				Select {selectedCategory}
			</h3>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each clothingItems.filter((item) => item.category === selectedCategory) as item (item.id)}
					<button
						on:click={() => selectItem(item)}
						class="flex flex-col items-center rounded-lg border border-gray-300 bg-white p-2 transition-colors duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
					>
						<img src={item.imageUrl} alt={item.name} class="h-24 w-24 rounded-md object-cover" />
						<p class="mt-2 text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
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
			class="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
		/>
		<button
			on:click={saveOutfit}
			class="w-full rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-primary-700"
		>
			Save Outfit
		</button>
	</div>

	<div class="mt-8">
		<h2 class="mb-4 text-2xl font-bold">Saved Outfits</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each savedOutfits as outfit (outfit.id)}
				<div
					class="relative rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
				>
					<button on:click={() => loadOutfit(outfit)} class="w-full text-left">
						<h3 class="font-semibold">{outfit.name}</h3>
						<p class="text-sm text-gray-400">Click to load</p>
					</button>
					<button
						on:click={() => deleteOutfit(outfit.id)}
						class="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-75 transition-opacity hover:bg-red-600 hover:opacity-100"
						title="Delete outfit"
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
	</div>
</div>
