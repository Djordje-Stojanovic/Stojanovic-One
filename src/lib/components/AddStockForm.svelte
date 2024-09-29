<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let identifier = '';
    let identifierType = 'symbol';
    let notes = '';
    let activeList = 'Watchlist';
    let isValid = false;
    let errorMessage = '';
    let isLoading = false;

    async function validateIdentifier() {
        isLoading = true;
        const response = await fetch(`/api/check-${identifierType}?${identifierType}=${identifier}`);
        const data = await response.json();
        isValid = data.isValid;
        errorMessage = data.error || '';
        isLoading = false;
    }

    async function handleSubmit() {
        if (!isValid) {
            errorMessage = 'Please enter a valid identifier';
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/fetch-stock-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier,
                    identifierType,
                    userId: $session?.user?.id,
                    notes,
                    listName: activeList
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            dispatch('stockAdded', result.data);
            identifier = '';
            notes = '';
            isValid = false;
        } catch (error: unknown) {
            console.error('Error adding stock:', error);
            errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        } finally {
            isLoading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div class="col-span-1">
        <label for="identifier" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {identifierType === 'symbol' ? 'Symbol' : 'ISIN'}
        </label>
        <div class="relative">
            <input
                type="text"
                id="identifier"
                bind:value={identifier}
                on:input={validateIdentifier}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
            {#if isValid}
                <div class="absolute right-2 top-2">
                    <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                </div>
            {/if}
        </div>
        <div class="mt-2 flex items-center space-x-4">
            <label class="inline-flex items-center">
                <input type="radio" class="form-radio" name="identifierType" value="symbol" bind:group={identifierType} on:change={validateIdentifier}>
                <span class="ml-2">Symbol</span>
            </label>
            <label class="inline-flex items-center">
                <input type="radio" class="form-radio" name="identifierType" value="isin" bind:group={identifierType} on:change={validateIdentifier}>
                <span class="ml-2">ISIN</span>
            </label>
        </div>
    </div>
    {#if errorMessage}
        <div class="mt-4 text-red-500 text-sm">{errorMessage}</div>
    {/if}
    <div class="mt-6">
        <label for="notes">Notes</label>
        <textarea
            id="notes"
            bind:value={notes}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            rows="4"
        ></textarea>
    </div>
    <div class="mt-6">
        <button
            type="submit"
            class="w-full rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
            disabled={!isValid || isLoading}
        >
            {isLoading ? 'Adding...' : 'Add Stock'}
        </button>
    </div>
    <button
        type="button"
        on:click={() => dispatch('close')}
        class="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
    >
        Close
    </button>
</form>