<script lang="ts">
	import { session } from '$lib/stores/sessionStore';
</script>

<svelte:head>
	<title>Clothing Outfit Calculator - Stojanovic-One</title>
</svelte:head>

{#if $session}
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-6 text-3xl font-bold">Clothing Outfit Calculator</h1>
		<p class="mb-4">Welcome to your personal Clothing Outfit Calculator!</p>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
				<h2 class="mb-4 text-xl font-semibold">Upload Clothing Items</h2>
				<p>Feature coming soon: Upload and categorize your clothing items.</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
				<h2 class="mb-4 text-xl font-semibold">Create Outfits</h2>
				<p>Feature coming soon: Mix and match your clothing items to create outfits.</p>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8 text-center">
		<h1 class="mb-4 text-3xl font-bold">Clothing Outfit Calculator</h1>
		<p class="text-xl">Please log in to access the Clothing Outfit Calculator.</p>
	</div>
{/if}
