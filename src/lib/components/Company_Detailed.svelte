<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	interface StockItem {
		id: string;
		symbol: string;
		list_name: string;
	}

	interface CompanyInfo {
		id: string;
		stock_item_id: string;
		description: string;
		industry: string;
		employees: number;
		founded: string;
		headquarters: string;
		website: string;
		notes: string;
	}

	let stockItem: StockItem | null = null;
	let companyInfo: CompanyInfo | null = null;
	let loading = true;
	let error: string | null = null;

	$: {
		const { listName, symbol } = $page.params;
		if (listName && symbol) {
			loadData(listName, symbol);
		}
	}

	async function loadData(listName: string, symbol: string) {
		loading = true;
		error = null;

		try {
			const { data: stockData, error: stockError } = await db
				.from('stock_items')
				.select('*')
				.eq('list_name', listName)
				.eq('symbol', symbol)
				.single();

			if (stockError) throw stockError;
			if (!stockData) throw new Error('Stock not found');

			const stock = stockData as StockItem;
			stockItem = stock;

			const { data: companyData, error: companyError } = await db
				.from('company_info')
				.select('*')
				.eq('stock_item_id', stock.id)
				.single();

			if (companyError) throw companyError;
			if (!companyData) throw new Error('Company info not found');

			companyInfo = companyData as CompanyInfo;
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unknown error occurred';
			stockItem = null;
			companyInfo = null;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{stockItem ? stockItem.symbol : 'Loading...'} - Investment Analysis Platform</title>
</svelte:head>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
		<LoadingSpinner size="w-12 h-12" />
	</div>
{:else if error}
	<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
		<p class="text-red-500">{error}</p>
	</div>
{:else if stockItem && companyInfo}
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">{stockItem.symbol}</h1>
		<div class="space-y-4">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">{companyInfo.description}</h2>
			<p><strong>Industry:</strong> {companyInfo.industry}</p>
			<p><strong>Employees:</strong> {companyInfo.employees}</p>
			<p><strong>Founded:</strong> {companyInfo.founded}</p>
			<p><strong>Headquarters:</strong> {companyInfo.headquarters}</p>
			<p>
				<strong>Website:</strong>
				<a
					href={companyInfo.website}
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
				>
					{companyInfo.website}
				</a>
			</p>
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
				<p class="mt-2 text-gray-600 dark:text-gray-300">{companyInfo.notes}</p>
			</div>
		</div>
	</div>
{/if}
