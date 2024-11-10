<script lang="ts">
    import { onMount } from 'svelte';

    export let statements: any[] = [];
    export let tableName: string = '';
    let tableContainer: HTMLDivElement;

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric' });
    }

    onMount(() => {
        if (tableContainer) {
            tableContainer.scrollLeft = tableContainer.scrollWidth;
        }
    });

    $: if (tableContainer && statements.length) {
        tableContainer.scrollLeft = tableContainer.scrollWidth;
    }
</script>

<style>
    .table-container {
        overflow-x: auto;
        background: #1F2937;
        border-radius: 0.375rem;
        scroll-behavior: smooth;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
    }

    .metric-name {
        position: sticky;
        left: 0;
        z-index: 10;
        min-width: 250px;
        padding: 12px 16px;
        text-align: left;
        background: inherit;
    }

    .metric-name.header {
        z-index: 11;
        background: #1F2937;
        border-bottom: 2px solid #4B5563;
        padding: 16px;
        font-weight: 600;
    }

    .value-cell {
        padding: 12px 16px;
        text-align: right;
        white-space: nowrap;
        background: inherit;
        border-left: 1px solid #374151;
    }

    /* Header row styling */
    thead tr th {
        background: #1F2937;
        padding: 16px;
        font-weight: 600;
        border-bottom: 2px solid #4B5563;
    }

    /* Sticky header */
    thead tr th {
        position: sticky;
        top: 0;
        z-index: 10;
    }
</style>

<div class="table-container" bind:this={tableContainer}>
    <table class="text-sm text-[#F9FAFB]">
        <thead>
            <tr>
                <th class="metric-name header">{tableName}</th>
                {#each sortedStatements as statement}
                    <th class="value-cell">
                        {formatDate(statement.date)}
                    </th>
                {/each}
            </tr>
        </thead>
        <slot />
    </table>
</div>
