<script lang="ts">
	import { session } from '$lib/stores/sessionStore';
	import ClothingItemUpload from '$lib/components/ClothingItemUpload.svelte';
	import ClothingGallery from '$lib/components/ClothingGallery.svelte';
	let refreshGallery: () => Promise<void>;
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
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div class="rounded-lg bg-secondary-100 p-6 shadow-md dark:bg-secondary-800">
				<h2 class="mb-4 text-xl font-semibold text-secondary-900 dark:text-secondary-50">
					Upload Clothing Items
				</h2>
				<ClothingItemUpload on:itemUploaded={refreshGallery} />
			</div>
			<div class="rounded-lg bg-secondary-100 p-6 shadow-md dark:bg-secondary-800">
				<h2 class="mb-4 text-xl font-semibold text-secondary-900 dark:text-secondary-50">
					Your Clothing Gallery
				</h2>
				<ClothingGallery bind:refreshData={refreshGallery} />
			</div>
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
