<script lang="ts">
    import { onMount } from 'svelte';
    import { investmentStore } from '$lib/stores/investmentStore';
    import { session } from '$lib/stores/sessionStore';

    // Subscribe to session changes and fetch stocks when session is available
    $: if ($session?.user) {
        investmentStore.fetchStocks();
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Backtesting Platform</h1>
        <p class="text-gray-700 dark:text-gray-300">This platform is under development. Check back soon!</p>
    </div>
</div>
