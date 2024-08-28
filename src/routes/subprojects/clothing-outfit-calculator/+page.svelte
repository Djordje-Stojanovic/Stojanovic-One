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
	<div class="flex h-screen bg-gray-100 dark:bg-gray-900">
		<!-- Sidebar for desktop -->
		<aside class="hidden w-64 bg-white shadow-md dark:bg-gray-800 md:block">
			<nav class="mt-5 px-2">
				<button
					on:click={() => setActiveComponent('gallery')}
					class="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium {activeComponent ===
					'gallery'
						? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
						: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>
					Gallery
				</button>
				<button
					on:click={() => setActiveComponent('upload')}
					class="group mt-1 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium {activeComponent ===
					'upload'
						? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
						: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>
					Upload
				</button>
				<button
					on:click={() => setActiveComponent('outfit')}
					class="group mt-1 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium {activeComponent ===
					'outfit'
						? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
						: 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>
					Outfit Creator
				</button>
			</nav>
		</aside>

		<!-- Main content -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
				<div class="container mx-auto px-4 py-8">
					<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
						Clothing Outfit Calculator
					</h1>
					<p class="mb-8 text-gray-700 dark:text-gray-300">
						Welcome to your personal Clothing Outfit Calculator!
					</p>

					{#if activeComponent === 'gallery'}
						<ClothingGallery bind:refreshData={refreshGallery} />
					{:else if activeComponent === 'upload'}
						<ClothingItemUpload on:itemUploaded={refreshGallery} />
					{:else if activeComponent === 'outfit'}
						<OutfitCreator />
					{/if}
				</div>
			</main>

			<!-- Floating navigation bar for mobile -->
			<div class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-800 md:hidden">
				<div class="flex justify-around">
					<button
						on:click={() => setActiveComponent('gallery')}
						class="flex-1 py-4 text-center text-sm font-medium {activeComponent === 'gallery'
							? 'border-t-2 border-primary-600 text-primary-600'
							: 'text-gray-500 dark:text-gray-400'}"
					>
						Gallery
					</button>
					<button
						on:click={() => setActiveComponent('upload')}
						class="flex-1 py-4 text-center text-sm font-medium {activeComponent === 'upload'
							? 'border-t-2 border-primary-600 text-primary-600'
							: 'text-gray-500 dark:text-gray-400'}"
					>
						Upload
					</button>
					<button
						on:click={() => setActiveComponent('outfit')}
						class="flex-1 py-4 text-center text-sm font-medium {activeComponent === 'outfit'
							? 'border-t-2 border-primary-600 text-primary-600'
							: 'text-gray-500 dark:text-gray-400'}"
					>
						Outfit
					</button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8 text-center">
		<h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
			Clothing Outfit Calculator
		</h1>
		<p class="text-xl text-gray-700 dark:text-gray-300">
			Please log in to access the Clothing Outfit Calculator.
		</p>
	</div>
{/if}
