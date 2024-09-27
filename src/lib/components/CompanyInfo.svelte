<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let companyInfo: {
        description: string;
        industry: string;
        employees: number | null;
        founded: number | null;
        headquarters: string;
        website: string;
        notes: string;
    };

    const dispatch = createEventDispatcher();

    let isUpdating = false;

    async function handleUpdate() {
        isUpdating = true;
        try {
            await dispatch('updateCompanyInfo', companyInfo);
            // Add a small delay to show the loading state
            await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
            isUpdating = false;
        }
    }
</script>

<div class="mt-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Company Information</h2>
    <div class="space-y-4">
        <div>
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
                id="description"
                bind:value={companyInfo.description}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
                rows="3"
            ></textarea>
        </div>
        <div>
            <label for="industry" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
            <input
                type="text"
                id="industry"
                bind:value={companyInfo.industry}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
            />
        </div>
        <div>
            <label for="employees" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Employees</label>
            <input
                type="number"
                id="employees"
                bind:value={companyInfo.employees}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
            />
        </div>
        <div>
            <label for="founded" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Founded</label>
            <input
                type="number"
                id="founded"
                bind:value={companyInfo.founded}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
            />
        </div>
        <div>
            <label for="headquarters" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Headquarters</label>
            <input
                type="text"
                id="headquarters"
                bind:value={companyInfo.headquarters}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
            />
        </div>
        <div>
            <label for="website" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
            <input
                type="url"
                id="website"
                bind:value={companyInfo.website}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
            />
        </div>
        <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
                id="notes"
                bind:value={companyInfo.notes}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
                rows="3"
            ></textarea>
        </div>
    </div>
    <button
        on:click={handleUpdate}
        class="mt-4 rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
        disabled={isUpdating}
    >
        {#if isUpdating}
            <span class="mr-2 inline-block animate-spin">⟳</span>
        {/if}
        {isUpdating ? 'Updating...' : 'Update Company Info'}
    </button>
</div>