<script lang="ts">
	import { session } from '$lib/stores/sessionStore';
	import ClothingItemUpload from '$lib/components/ClothingItemUpload.svelte';
	import ClothingGallery from '$lib/components/ClothingGallery.svelte';
	import OutfitCreator from '$lib/components/OutfitCreator.svelte';
	let refreshGallery: () => Promise<void>;
	let activeComponent = 'gallery';

	function setActiveComponent(component: string) {
		activeComponent = component;
	}
</script>

<svelte:head>
	<title>Clothing Outfit Calculator - Stojanovic-One</title>
</svelte:head>

{#if $session}
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-6 text-3xl font-bold text-secondary-900 dark:text-secondary-50">
			Clothing Outfit Calculator
		</h1>
		<p class="mb-8 text-secondary-700 dark:text-secondary-200">
			Welcome to your personal Clothing Outfit Calculator!
		</p>

		<!-- Floating navigation bar for mobile -->
		<div
			class="fixed bottom-0 left-0 right-0 z-50 bg-secondary-100 p-2 shadow-md dark:bg-secondary-800 md:hidden"
		>
			<div class="flex justify-around">
				<button
					on:click={() => setActiveComponent('gallery')}
					class="rounded-md px-3 py-2 text-sm font-medium {activeComponent === 'gallery'
						? 'bg-primary-600 text-white'
						: 'text-secondary-700 hover:bg-secondary-200 dark:text-secondary-200 dark:hover:bg-secondary-700'}"
				>
					Gallery
				</button>
				<button
					on:click={() => setActiveComponent('upload')}
					class="rounded-md px-3 py-2 text-sm font-medium {activeComponent === 'upload'
						? 'bg-primary-600 text-white'
						: 'text-secondary-700 hover:bg-secondary-200 dark:text-secondary-200 dark:hover:bg-secondary-700'}"
				>
					Upload
				</button>
				<button
					on:click={() => setActiveComponent('outfit')}
					class="rounded-md px-3 py-2 text-sm font-medium {activeComponent === 'outfit'
						? 'bg-primary-600 text-white'
						: 'text-secondary-700 hover:bg-secondary-200 dark:text-secondary-200 dark:hover:bg-secondary-700'}"
				>
					Outfit
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div
				class="rounded-lg bg-secondary-100 p-6 shadow-md dark:bg-secondary-800 {activeComponent !==
				'upload'
					? 'hidden md:block'
					: ''}"
			>
				<h2 class="mb-4 text-xl font-semibold text-secondary-900 dark:text-secondary-50">
					Upload Clothing Items
				</h2>
				<ClothingItemUpload on:itemUploaded={refreshGallery} />
			</div>
			<div
				class="rounded-lg bg-secondary-100 p-6 shadow-md dark:bg-secondary-800 {activeComponent !==
				'gallery'
					? 'hidden md:block'
					: ''}"
			>
				<h2 class="mb-4 text-xl font-semibold text-secondary-900 dark:text-secondary-50">
					Your Clothing Gallery
				</h2>
				<ClothingGallery bind:refreshData={refreshGallery} />
			</div>
		</div>
		<div
			class="mt-8 rounded-lg bg-secondary-100 p-6 shadow-md dark:bg-secondary-800 {activeComponent !==
			'outfit'
				? 'hidden md:block'
				: ''}"
		>
			<h2 class="mb-4 text-xl font-semibold text-secondary-900 dark:text-secondary-50">
				Create Your Outfit
			</h2>
			<OutfitCreator />
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8 text-center">
		<h1 class="mb-4 text-3xl font-bold text-secondary-900 dark:text-secondary-50">
			Clothing Outfit Calculator
		</h1>
		<p class="text-xl text-secondary-700 dark:text-secondary-200">
			Please log in to access the Clothing Outfit Calculator.
		</p>
	</div>
{/if}
