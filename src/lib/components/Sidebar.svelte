<script lang="ts">
    export let activeSection: string;
    export let onSectionChange: (section: string) => void;

    const listNames = [
        'Watchlist',
        'Due Diligence',
        'Buy Ready',
        'Too Expensive',
        'Pass For Now',
        'Permanent Pass',
        'Core Holdings',
        'Regular Review',
        'Sell Ready',
        'Sold'
    ];
</script>

<aside class="w-64 bg-white p-4 shadow-md dark:bg-gray-800">
    <nav>
        <ul>
            {#each listNames as listName}
                <li class="mb-2">
                    <button
                        class="w-full rounded-lg px-4 py-2 text-left transition-colors {activeSection === listName ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
                        on:click={() => onSectionChange(listName)}
                    >
                        {listName}
                    </button>
                </li>
            {/each}
        </ul>
    </nav>
</aside>