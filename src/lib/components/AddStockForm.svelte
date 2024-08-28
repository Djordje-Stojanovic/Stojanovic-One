<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let symbol = '';
	let companyName = '';
	let sector = '';
	let currentPrice = '';
	let targetPrice = '';
	let notes = '';

	async function handleSubmit() {
		if (!$session) return;

		const newStock = {
			user_id: $session.user.id,
			symbol,
			company_name: companyName,
			sector,
			current_price: parseFloat(currentPrice),
			target_price: parseFloat(targetPrice),
			notes
		};

		const { data, error } = await supabase.from('watchlist_items').insert(newStock).select();

		if (error) {
			console.error('Error adding stock:', error);
		} else {
			dispatch('stockAdded', data[0]);
			resetForm();
		}
	}

	function resetForm() {
		symbol = '';
		companyName = '';
		sector = '';
		currentPrice = '';
		targetPrice = '';
		notes = '';
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="mb-6 max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<div class="col-span-1">
			<label for="symbol" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Symbol</label
			>
			<input
				type="text"
				id="symbol"
				bind:value={symbol}
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
			/>
		</div>
		<div class="col-span-1">
			<label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Company Name</label
			>
			<input
				type="text"
				id="companyName"
				bind:value={companyName}
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
			/>
		</div>
		<div class="col-span-1">
			<label for="sector" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Sector</label
			>
			<input
				type="text"
				id="sector"
				bind:value={sector}
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
			/>
		</div>
		<div class="col-span-1">
			<label for="currentPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Current Price</label
			>
			<input
				type="number"
				id="currentPrice"
				bind:value={currentPrice}
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
			/>
		</div>
		<div class="col-span-1">
			<label for="targetPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>Target Price</label
			>
			<input
				type="number"
				id="targetPrice"
				bind:value={targetPrice}
				required
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
			/>
		</div>
	</div>
	<div class="mt-6">
		<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
			>Notes</label
		>
		<textarea
			id="notes"
			bind:value={notes}
			rows="3"
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
		></textarea>
	</div>
	<div class="mt-6">
		<button
			type="submit"
			class="w-full rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
		>
			Add Stock
		</button>
	</div>
</form>
