<script lang="ts">
    import { onMount } from 'svelte';

    export let statements: any[] = [];
    export let tableName: string = '';
    let tableContainer: HTMLDivElement;

    // Sort statements by date (ascending - oldest to newest)
    $: sortedStatements = [...statements].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    function formatDate(date: string, period: string) {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        
        if (period === 'FY') {
            return year.toString();
        }

        if (period === 'TTM') {
            // Extract the quarter from the previous quarter's data
            const month = dateObj.getMonth() + 1; // JavaScript months are 0-based
            let quarter;
            if (month <= 3) quarter = 'Q1';
            else if (month <= 6) quarter = 'Q2';
            else if (month <= 9) quarter = 'Q3';
            else quarter = 'Q4';
            
            return `${year} ${quarter} TTM`;
        }
        
        // For quarterly data, use the period directly (Q1, Q2, Q3, Q4)
        return `${year} ${period}`;
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
        background: #1F2937;
        border-right: 2px solid #4B5563;
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

    /* Ensure sticky column has proper background */
    :global(tbody tr td:first-child) {
        position: sticky !important;
        left: 0;
        z-index: 1;
        background: #1F2937 !important;
        border-right: 2px solid #4B5563;
    }

    /* Add shadow to sticky column */
    :global(tbody tr td:first-child::after) {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0));
        pointer-events: none;
    }
</style>

<div class="table-container" bind:this={tableContainer}>
    <table class="text-sm text-[#F9FAFB]">
        <thead>
            <tr>
                <th class="metric-name header">{tableName}</th>
                {#each sortedStatements as statement}
                    <th class="value-cell">
                        {formatDate(statement.date, statement.period)}
                    </th>
                {/each}
            </tr>
        </thead>
        <slot />
    </table>
</div>
