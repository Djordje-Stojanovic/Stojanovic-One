<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { page } from '$app/stores';
    import { db } from '$lib/supabaseClient';

    let symbol = $page.params.symbol;
    let selectedMetrics: string[] = [];

    // Subscribe to store to sync active states
    $: {
        selectedMetrics = $chartStore.selectedMetrics
            .filter(m => !m.hidden)
            .map(m => m.name);
    }

    function handleMetricClick(metricName: string) {
        const isActive = selectedMetrics.includes(metricName);
        
        if (!isActive) {
            chartStore.handleMetricClick(metricName, [], []);
        } else {
            chartStore.handleMetricClick(metricName, [], []);
        }
    }

    // Reset when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        selectedMetrics.forEach(metric => {
            chartStore.handleMetricClick(metric, [], []);
        });
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: rgb(147, 51, 234); background-color: {selectedMetrics.includes('P/E Ratio') ? 'rgba(147, 51, 234, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('P/E Ratio')}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(147, 51, 234);"></span>
            P/E Ratio
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: rgb(6, 182, 212); background-color: {selectedMetrics.includes('FCF Yield') ? 'rgba(6, 182, 212, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('FCF Yield')}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(6, 182, 212);"></span>
            FCF Yield
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: rgb(245, 158, 11); background-color: {selectedMetrics.includes('P/S Ratio') ? 'rgba(245, 158, 11, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('P/S Ratio')}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(245, 158, 11);"></span>
            P/S Ratio
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: rgb(59, 130, 246); background-color: {selectedMetrics.includes('EV/EBITDA') ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('EV/EBITDA')}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(59, 130, 246);"></span>
            EV/EBITDA
        </button>

        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: rgb(16, 185, 129); background-color: {selectedMetrics.includes('P/GP Ratio') ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={() => handleMetricClick('P/GP Ratio')}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: rgb(16, 185, 129);"></span>
            P/GP Ratio
        </button>
    </div>
</div>
