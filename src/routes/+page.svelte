<script lang="ts">
	import { onMount } from 'svelte';
	import { session } from '$lib/stores/sessionStore';
	import SubprojectCard from '$lib/components/SubprojectCard.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let subprojects = [
		{
			id: 'clothing-outfit-calculator',
			title: 'Clothing Outfit Calculator',
			description: 'Mix and match your clothing items to create perfect outfits.',
			route: '/subprojects/clothing-outfit-calculator'
		},
		{
			id: 'investment-analysis-platform',
			title: 'Investment Analysis Platform',
			description: 'Analyze investments, manage watchlists, and make informed decisions.',
			route: '/subprojects/investment-analysis-platform'
		}
	];
	let loading = true;
	let sessionChecked = false;

	onMount(async () => {
		if (browser) {
			const {
				data: { session: currentSession }
			} = await supabase.auth.getSession();
			if (currentSession) {
				$session = currentSession;
				if (window.location.pathname === '/login') {
					const from = new URLSearchParams(window.location.search).get('from') || '/';
					goto(from);
				}
			} else if (window.location.pathname !== '/login') {
				goto('/login?redirected=true&from=' + window.location.pathname);
			}

			if ($session) {
				const { data, error } = await supabase.from('subprojects').select('id, title, description');
				if (error) {
					console.error('Error fetching subprojects:', error);
				} else if (data) {
					subprojects = [...subprojects, ...data.map(item => ({...item, route: `/subproject/${item.id}`}))];
				}
			}

			loading = false;
			sessionChecked = true;
		}
	});
</script>

<svelte:head>
	<title>Dashboard - Stojanovic-One</title>
</svelte:head>

{#if !sessionChecked}
	<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
		<LoadingSpinner size="w-12 h-12" />
	</div>
{:else if $session}
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-6 text-3xl font-bold">Your Subprojects</h1>
		{#if loading}
			<LoadingSpinner size="w-12 h-12" />
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each subprojects as subproject (subproject.id)}
					<SubprojectCard
						title={subproject.title}
						description={subproject.description}
						route={subproject.route || `/subproject/${subproject.id}`}
					/>
				{/each}
			</div>
		{/if}
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
