<script lang="ts">
    // Grid-based layout container for a section of the financials header
    export let title: string = '';
</script>

<div class="mb-4">
    {#if title}
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
    {/if}
    <div class="flex flex-wrap items-center gap-2">
        <slot></slot>
    </div>
</div>