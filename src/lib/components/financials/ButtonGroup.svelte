<script lang="ts">
    export let activeValue: string | number;
    export let options: { label: string; value: string | number }[];
    export let name = '';
    
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    function handleClick(value: string | number) {
        dispatch('change', { value });
    }
</script>

<div class="inline-flex rounded-md shadow-sm">
    {#each options as option, i}
        <button 
            class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 transition-colors duration-300
                   {activeValue === option.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-gray-700 dark:text-gray-200'}
                   {i === 0 ? 'rounded-l-md' : ''} 
                   {i === options.length - 1 ? 'rounded-r-md' : 'border-r-0'}"
            on:click={() => handleClick(option.value)}
            aria-label={`${name} ${option.label}`}
            aria-pressed={activeValue === option.value}
        >
            {option.label}
        </button>
    {/each}
</div>