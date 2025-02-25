<script lang="ts">
    export let icon: string | null = null;
    export let color: 'blue' | 'green' | 'purple' | 'cyan' = 'blue';
    export let loading = false;
    export let disabled = false;
    export let minWidth = "120px";
    
    const colorClasses = {
        blue: 'bg-blue-500 hover:bg-blue-600',
        green: 'bg-green-500 hover:bg-green-600',
        purple: 'bg-purple-500 hover:bg-purple-600',
        cyan: 'bg-cyan-500 hover:bg-cyan-600'
    };
</script>

<button
    class="flex-1 min-w-[{minWidth}] font-bold {colorClasses[color]} text-white 
           px-3 py-2 rounded text-sm transition-colors duration-300 
           flex items-center justify-center gap-2"
    on:click
    {disabled}
>
    {#if loading}
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        <span>Syncing...</span>
    {:else}
        {#if icon}
            {@html icon}
        {/if}
        <slot></slot>
    {/if}
</button>