<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import type { ListName } from '$lib/constants/listNames';
    import { session } from '$lib/stores/sessionStore';
    import { stockForm, isFormValid } from '$lib/stores/stockFormStore';

    const dispatch = createEventDispatcher();

    export let activeList: ListName;
    let inputElement: HTMLInputElement;

    function handleEscape(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            $stockForm.showSuggestions = false;
            dispatch('close');
        }
    }

    function handleInput() {
        stockForm.updateSuggestions($stockForm.identifier);
        if ($session?.access_token) {
            stockForm.validateIdentifier($session.access_token);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!$stockForm.showSuggestions) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                stockForm.navigateSuggestions('down');
                break;
            case 'ArrowUp':
                event.preventDefault();
                stockForm.navigateSuggestions('up');
                break;
            case 'Enter':
                event.preventDefault();
                if ($stockForm.suggestionIndex >= 0) {
                    stockForm.selectSuggestion($stockForm.suggestions[$stockForm.suggestionIndex]);
                    if ($session?.access_token) {
                        stockForm.validateIdentifier($session.access_token);
                    }
                }
                break;
            case 'Escape':
                event.preventDefault();
                stockForm.hideSuggestions();
                break;
        }
    }

    async function handleSubmit() {
        if (!$session?.access_token) {
            stockForm.setErrorMessage('Please log in to add stocks');
            return;
        }

        if (!$stockForm.isValid) {
            stockForm.setErrorMessage('Please enter a valid symbol');
            return;
        }

        const stockId = await stockForm.submitForm(activeList, $session.access_token);
        if (stockId) {
            dispatch('stockAdded', { id: stockId });
            stockForm.reset();
            setTimeout(() => {
                dispatch('close');
            }, 100);
        }
    }
</script>

<svelte:window on:keydown={handleEscape}/>

<div class="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Modal backdrop -->
        <button 
            type="button"
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity cursor-default"
            on:click={() => dispatch('close')}
        ></button>

        <span class="hidden sm:inline-block sm:h-screen sm:align-middle"></span>

        <!-- Modal panel -->
        <div
            class="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle dark:bg-gray-800"
            in:fly="{{ y: 50, duration: 300 }}"
            out:fade="{{ duration: 200 }}"
        >
            <button
                type="button"
                class="absolute top-4 right-4 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                on:click={() => dispatch('close')}
            >
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div class="sm:flex sm:items-start">
                <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <h2 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                        Add New Stock
                    </h2>
                    <div class="mt-2">
                        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                            <div>
                                <label for="identifier" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Stock Symbol
                                </label>
                                <div class="relative mt-1">
                                    <input
                                        type="text"
                                        id="identifier"
                                        bind:value={$stockForm.identifier}
                                        bind:this={inputElement}
                                        on:input={handleInput}
                                        on:keydown={handleKeydown}
                                        required
                                        autocomplete="off"
                                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                                        placeholder="e.g., AAPL"
                                    >
                                    {#if $stockForm.showSuggestions}
                                        <div class="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-700">
                                            <div class="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                {#each $stockForm.suggestions as symbol, i}
                                                    <button
                                                        type="button"
                                                        class="w-full text-left px-4 py-2 text-gray-900 hover:bg-primary-100 dark:text-white dark:hover:bg-gray-600 {i === $stockForm.suggestionIndex ? 'bg-primary-100 dark:bg-gray-600' : ''}"
                                                        on:click={() => {
                                                            stockForm.selectSuggestion(symbol);
                                                            if ($session?.access_token) {
                                                                stockForm.validateIdentifier($session.access_token);
                                                            }
                                                        }}
                                                    >
                                                        {symbol}
                                                    </button>
                                                {/each}
                                            </div>
                                        </div>
                                    {/if}
                                    {#if $stockForm.isValid}
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                    {/if}
                                </div>
                            </div>

                            {#if $stockForm.errorMessage}
                                <p class="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{$stockForm.errorMessage}</p>
                            {/if}

                            <div>
                                <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                <textarea
                                    id="notes"
                                    bind:value={$stockForm.notes}
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!$isFormValid}
                                >
                                    {$stockForm.isLoading ? 'Adding...' : 'Add Stock'}
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
