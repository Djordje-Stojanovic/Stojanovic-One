<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';
    import { createEventDispatcher } from 'svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

    const dispatch = createEventDispatcher();

    export let activeList = 'Watchlist'; // Default value

    // Use 'identifier' to store either symbol or ISIN
    let identifier = '';
    let companyName = '';
    let sector = '';
    let currentPrice = '';
    let targetPrice = '';
    let notes = '';
    let errorMessage = '';
    let isLoading = false;
    let isIdentifierValid = false;
    let isCheckingIdentifier = false;

    let identifierType = 'symbol'; // Default to symbol

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const checkIdentifierValidity = debounce(async (identifier: string) => {
        if (!identifier) {
            isIdentifierValid = false;
            return;
        }
        isCheckingIdentifier = true;
        try {
            const response = await fetch(`/api/check-${identifierType}?${identifierType}=${encodeURIComponent(identifier)}`);
            const result = await response.json();
            isIdentifierValid = result.isValid;
            if (!result.isValid && result.error) {
                console.error(`${identifierType.toUpperCase()} check error:`, result.error);
            }
        } catch (error) {
            console.error(`Error checking ${identifierType}:`, error);
            isIdentifierValid = false;
        } finally {
            isCheckingIdentifier = false;
        }
    }, 300);

    // Revalidate when identifierType or symbol changes
    $: if (identifier) {
        checkIdentifierValidity(identifier);
    } else {
        isIdentifierValid = false;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        isLoading = true;
        errorMessage = '';
        try {
            // Ensure session user ID is available
            const userId = $session?.user?.id;
            if (!userId) {
                throw new Error('User is not authenticated');
            }
            const stockData = {
                user_id: userId,
                symbol: identifierType === 'symbol' ? identifier : null,
                isin: identifierType === 'isin' ? identifier : null,
                company_name: companyName,
                sector,
                current_price: currentPrice ? parseFloat(currentPrice) : null,
                target_price: targetPrice ? parseFloat(targetPrice) : null,
                notes,
                list_name: activeList
            };

            const { data, error } = await supabase
                .from('stock_items')
                .insert([stockData])
                .select(); // Ensure data is returned

            if (error) throw error;
            if (data && data.length > 0) {
                dispatch('stockAdded', data[0]);
                // Optionally reset the form or close it
            } else {
                throw new Error('No data returned from insert operation');
            }
        } catch (error) {
            console.error('Error adding stock:', error);
            errorMessage = 'Failed to add stock. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<form class="mb-6 max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800" on:submit={handleSubmit}>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="col-span-1">
            <label for="identifier" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {identifierType === 'symbol' ? 'Symbol' : 'ISIN'}
            </label>
            <div class="relative">
                <input
                    type="text"
                    id="identifier"
                    bind:value={identifier}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm {isIdentifierValid ? 'border-green-500' : 'border-red-500'}"
                />
                {#if isCheckingIdentifier}
                    <div class="absolute right-2 top-2">
                        <LoadingSpinner size="w-5 h-5" />
                    </div>
                {:else if identifier}
                    <div class="absolute right-2 top-2">
                        {#if isIdentifierValid}
                            <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        {:else}
                            <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        {/if}
                    </div>
                {/if}
            </div>
            <div class="mt-2 flex items-center space-x-4">
                <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="identifierType" value="symbol" bind:group={identifierType}>
                    <span class="ml-2">Symbol</span>
                </label>
                <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="identifierType" value="isin" bind:group={identifierType}>
                    <span class="ml-2">ISIN</span>
                </label>
            </div>
        </div>

        <div class="col-span-1">
            <label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
            <input
                type="text"
                id="companyName"
                bind:value={companyName}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
        </div>

        <div class="col-span-1">
            <label for="sector" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Sector</label>
            <input
                type="text"
                id="sector"
                bind:value={sector}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
        </div>

        <div class="col-span-1">
            <label for="currentPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Price</label>
            <input
                type="number"
                id="currentPrice"
                bind:value={currentPrice}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
        </div>

        <div class="col-span-1">
            <label for="targetPrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Price</label>
            <input
                type="number"
                id="targetPrice"
                bind:value={targetPrice}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
        </div>
    </div>

    {#if errorMessage}
        <div class="mt-4 text-red-500 text-sm">{errorMessage}</div>
    {/if}

    <div class="mt-6">
        <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
        <textarea
            id="notes"
            bind:value={notes}
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        ></textarea>
    </div>

    <div class="mt-6">
        <button
            type="submit"
            class="w-full rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
            disabled={!isIdentifierValid || isLoading}
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
