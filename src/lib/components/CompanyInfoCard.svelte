<script lang="ts">
	import { db } from '$lib/supabaseClient';
	import type { CompanyInfo } from '$lib/types';

	export let stockItemId: string;

	let companyInfo: CompanyInfo | null = null;

	async function loadCompanyInfo() {
		console.log('Loading company info for stock_item_id:', stockItemId);
		const { data, error } = await db
			.from('company_info')
			.select('*')
			.eq('stock_item_id', stockItemId);

		if (error) {
			console.error('Error loading company info:', error);
		} else if (data && data.length > 0) {
			companyInfo = data[0];
			console.log('Loaded company info:', companyInfo);
		} else {
			console.log('No company info found for stock_item_id:', stockItemId);
			companyInfo = null;
		}
	}

	$: {
		if (stockItemId) {
			loadCompanyInfo();
		}
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
	{#if companyInfo}
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
					>{companyInfo.website}</a
				>
			</p>
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
				<p class="mt-2 text-gray-600 dark:text-gray-300">{companyInfo.notes}</p>
			</div>
		</div>
	{:else}
		<p class="text-gray-600 dark:text-gray-300">No company information available.</p>
	{/if}
</div>
