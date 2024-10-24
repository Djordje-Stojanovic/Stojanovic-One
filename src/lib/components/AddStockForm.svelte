<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import type { ListName } from '$lib/constants/listNames';
    import { session } from '$lib/stores/sessionStore';

    const dispatch = createEventDispatcher();

    let identifier = '';
    let identifierType = 'symbol';
    let notes = '';
    export let activeList: ListName;
    let isValid = false;
    let errorMessage = '';
    let isLoading = false;

    async function validateIdentifier() {
        if (!$session?.user) {
            errorMessage = 'Please log in to add stocks';
            isValid = false;
            return;
        }

        if (!identifier) {
            isValid = false;
            errorMessage = '';
            return;
        }

        isLoading = true;
        try {
            const response = await fetch(`/api/check-${identifierType}?${identifierType}=${identifier}`, {
                headers: {
                    'Authorization': `Bearer ${$session.access_token}`
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to validate identifier');
            }
            
            const data = await response.json();
            isValid = data.isValid;
            errorMessage = data.error || '';
        } catch (error) {
            console.error('Error validating identifier:', error);
            errorMessage = error instanceof Error ? error.message : 'Failed to validate identifier';
            isValid = false;
        } finally {
            isLoading = false;
        }
    }

    async function handleSubmit() {
        if (!$session?.user) {
            errorMessage = 'Please log in to add stocks';
            return;
        }

        if (!isValid) {
            errorMessage = 'Please enter a valid identifier';
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/fetch-stock-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${$session.access_token}`
                },
                body: JSON.stringify({
                    identifier,
                    identifierType,
                    notes,
                    listName: activeList
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add stock');
            }

            const result = await response.json();
            dispatch('stockAdded', result.data);
            identifier = '';
            notes = '';
            isValid = false;
            errorMessage = '';
            dispatch('close');
        } catch (error) {
            console.error('Error adding stock:', error);
            errorMessage = error instanceof Error ? error.message : 'Failed to add stock';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" on:click={() => dispatch('close')}></div>
        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div
            in:fly="{{ y: 50, duration: 300 }}"
            out:fade="{{ duration: 200 }}"
            class="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle dark:bg-gray-800"
        >
            <div class="absolute top-0 right-0 pt-4 pr-4">
                <button
                    type="button"
                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                    on:click={() => dispatch('close')}
                >
                    <span class="sr-only">Close</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="sm:flex sm:items-start">
                <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100" id="modal-title">
                        Add New Stock
                    </h3>
                    <div class="mt-2">
                        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                            <div>
                                <label for="identifier" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {identifierType === 'symbol' ? 'Symbol' : 'ISIN'}
                                </label>
                                <div class="relative mt-1">
                                    <input
                                        type="text"
                                        id="identifier"
                                        bind:value={identifier}
                                        on:input={validateIdentifier}
                                        required
                                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                    >
                                    {#if isValid}
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <label class="inline-flex items-center">
                                    <input type="radio" class="form-radio text-primary-600" name="identifierType" value="symbol" bind:group={identifierType} on:change={validateIdentifier}>
                                    <span class="ml-2">Symbol</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" class="form-radio text-primary-600" name="identifierType" value="isin" bind:group={identifierType} on:change={validateIdentifier}>
                                    <span class="ml-2">ISIN</span>
                                </label>
                            </div>
                            {#if errorMessage}
                                <p class="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                            {/if}
                            <div>
                                <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                <textarea
                                    id="notes"
                                    bind:value={notes}
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                    rows="4"
                                ></textarea>
                            </div>
                            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!isValid || isLoading || !$session?.user}
                                >
                                    {isLoading ? 'Adding...' : 'Add Stock'}
                                </button>
                                <button
                                    type="button"
                                    on:click={() => dispatch('close')}
                                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
