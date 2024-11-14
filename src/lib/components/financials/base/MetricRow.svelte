<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { formatNumber } from '$lib/utils/numberFormat';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let name: string;
    export let values: number[];
    export let dates: string[];
    export let numberFormat: NumberFormat;
    export let isTotal = false;
    export let indented = false;
    export let isSelected = false;

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('metricClick', {
            name,
            values,
            dates
        });
    }

    $: rowClass = `
        ${indented ? 'pl-8' : ''} 
        ${isTotal ? 'font-semibold bg-gray-700/50 dark:bg-gray-700/50 hover:bg-gray-600/50 dark:hover:bg-gray-600/50 cursor-pointer' : 'hover:bg-gray-600/20 dark:hover:bg-gray-600/40 cursor-pointer'}
        ${isSelected ? 'bg-blue-500/20 dark:bg-blue-500/20' : ''}
        transition-colors duration-200
    `;
</script>

<tr class={rowClass} on:click={handleClick}>
    <td class="metric-name">
        <div class="flex items-center gap-2">
            {#if isSelected}
                <span class="text-blue-500">●</span>
            {/if}
            {name}
        </div>
    </td>
    {#each values as value, i}
        <td class="value-cell">
            {value !== null ? formatNumber(value, numberFormat).formatted : '-'}
        </td>
    {/each}
</tr>

<style>
    .metric-name {
        padding: 0.5rem 1rem;
        position: sticky;
        left: 0;
        background: inherit;
        z-index: 1;
        border-right: 2px solid #4B5563;
    }

    .value-cell {
        padding: 0.5rem 1rem;
        text-align: right;
        white-space: nowrap;
        border-right: 1px solid #374151;
    }

    .value-cell:last-child {
        border-right: none;
    }
</style>
