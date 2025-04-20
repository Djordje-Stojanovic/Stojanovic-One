<script lang="ts">
	import { sessionStore } from '$lib/stores/sessionStore';
	import SubprojectCard from '$lib/components/SubprojectCard.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { db } from '$lib/supabaseClient';

	let subprojects = [
		{
			id: 'investment-analysis-platform',
			title: 'Investment Analysis Platform',
			description: 'Analyze investments, manage watchlists, and make informed decisions.',
			route: '/subprojects/investment-analysis-platform'
		},
		{
			id: 'backtesting-platform',
			title: 'Backtesting Platform',
			description: 'Test investment strategies against historical data.',
			route: '/subprojects/backtesting-platform'
		}
	];
	let loading = true;

	// Load additional subprojects if user is authenticated
	$: if ($sessionStore.session) {
		db
			.from('subprojects')
			.select('id, title, description')
			.then(({ data, error }) => {
				if (error) {
					console.error('Error fetching subprojects:', error);
				} else if (data) {
					subprojects = [
						...subprojects,
						...data.map(item => ({ ...item, route: `/subproject/${item.id}` }))
					];
				}
				loading = false;
			});
	} else {
		loading = false;
	}
</script>

<svelte:head>
	<title>Dashboard - Stojanovic-One</title>
</svelte:head>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
		<LoadingSpinner size="w-12 h-12" />
	</div>
{:else if $sessionStore.session}
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-6 text-3xl font-bold">Your Subprojects</h1>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each subprojects as subproject (subproject.id)}
				<SubprojectCard
					title={subproject.title}
					description={subproject.description}
					route={subproject.route || `/subproject/${subproject.id}`}
				/>
			{/each}
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
				Welcome to Stojanovic-One
			</h1>
			<p class="text-xl text-gray-700 dark:text-gray-300">Please log in to view your dashboard.</p>
		</div>
	</div>
{/if}
