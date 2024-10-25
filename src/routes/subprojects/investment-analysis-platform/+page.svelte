<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import AddStockForm from '$lib/components/AddStockForm.svelte';
    import StockItem from '$lib/components/StockItem.svelte';
    import type { ListName } from '$lib/constants/listNames';
    import { listNames } from '$lib/constants/listNames';
    import { session } from '$lib/stores/sessionStore';
    import type { UserStock } from '$lib/types';
    import { moveStock } from '$lib/utils/stockMoves';

    let showAddForm = false;
    let stocks: UserStock[] = [];
    let loading = true;
    let error: string | null = null;
    let isSyncing = false;
    let syncError: string | null = null;
    let syncResult: string | null = null;
    let hoveredList: ListName | null = null;
    let activeList: ListName = 'Watchlist';

    async function syncSymbols() {
        if (isSyncing) return;
        
        isSyncing = true;
        syncError = null;
        syncResult = null;
        
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('/subprojects/investment-analysis-platform/sync-symbols', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentSession.access_token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to sync symbols');
            }
            
            syncResult = `Successfully synced ${data.count} symbols`;
            await fetchStocks();
        } catch (e) {
            console.error('Error syncing symbols:', e);
            syncError = e instanceof Error ? e.message : 'An unknown error occurred';
        } finally {
            isSyncing = false;
        }
    }

    async function fetchStocks() {
        try {
            const { data, error: fetchError } = await supabase
                .from('user_stocks')
                .select(`
                    *,
                    metadata:stock_metadata (*)
                `)
                .eq('user_id', $session?.user?.id);

            if (fetchError) throw fetchError;
            stocks = data || [];
        } catch (e) {
            console.error('Error fetching stocks:', e);
            error = e instanceof Error ? e.message : 'Failed to fetch stocks';
        } finally {
            loading = false;
        }
    }

    onMount(fetchStocks);

    async function handleStockAdded(event: CustomEvent<{ id: string }>) {
        const newStockId = event.detail.id;
        try {
            const { data, error: fetchError } = await supabase
                .from('user_stocks')
                .select(`
                    *,
                    metadata:stock_metadata (*)
                `)
                .eq('id', newStockId)
                .single();

            if (fetchError) throw fetchError;
            if (data) {
                stocks = [...stocks, data];
            }
        } catch (e) {
            console.error('Error fetching new stock data:', e);
            error = e instanceof Error ? e.message : 'Failed to fetch new stock data';
        }
    }

    async function handleMoveItem(event: CustomEvent<{ stockId: string; newListName: ListName }>) {
        const { stockId, newListName } = event.detail;
        try {
            const { data, error: moveError } = await moveStock(stockId, newListName);
            if (moveError) throw moveError;
            if (data) {
                await fetchStocks();
            }
        } catch (error) {
            console.error('Error updating stock list:', error);
            alert('Failed to move stock. Please try again.');
        }
    }

    function handleDragOver(e: DragEvent, listName: ListName) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        hoveredList = listName;
    }

    function handleDragLeave() {
        hoveredList = null;
    }

    async function handleDrop(e: DragEvent, newListName: ListName) {
        e.preventDefault();
        const stockId = e.dataTransfer?.getData('text/plain');
        if (!stockId || !$session?.user) return;
        await handleMoveItem(new CustomEvent('moveItem', { detail: { stockId, newListName } }));
        hoveredList = null;
    }

    async function handleDeleteItem(event: CustomEvent<string>) {
        const stockId = event.detail;
        try {
            const { error: deleteError } = await supabase
                .from('user_stocks')
                .delete()
                .eq('id', stockId);

            if (deleteError) throw deleteError;

            // Update local state only if the database operation was successful
            stocks = stocks.filter(stock => stock.id !== stockId);
        } catch (error) {
            console.error('Error deleting stock:', error);
            alert('Failed to delete stock. Please try again.');
        }
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Investment Analysis Platform</h1>
            <div class="space-x-2">
                <button
                    on:click={syncSymbols}
                    disabled={isSyncing}
                    class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    {isSyncing ? 'Syncing...' : 'Sync Symbols'}
                </button>
                <button
                    on:click={() => (showAddForm = true)}
                    class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Add Stock
                </button>
            </div>
        </div>

        {#if syncResult}
            <div class="mb-4 rounded-md bg-green-100 p-4 text-green-700 dark:bg-green-800 dark:text-green-100 transition-colors duration-300">
                {syncResult}
            </div>
        {/if}

        {#if syncError}
            <div class="mb-4 rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-800 dark:text-red-100 transition-colors duration-300">
                Error syncing symbols: {syncError}
            </div>
        {/if}

        {#if loading}
            <div class="flex justify-center">
                <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        {:else if error}
            <div class="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-800 dark:text-red-100 transition-colors duration-300">{error}</div>
        {:else if stocks.length === 0}
            <div class="text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
                No stocks added yet. Click "Add Stock" to get started.
            </div>
        {:else}
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {#each [...listNames] as listName (listName)}
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 {hoveredList === listName ? 'ring-2 ring-blue-500' : ''}"
                        role="list"
                        on:dragover={(e) => handleDragOver(e, listName)}
                        on:dragleave={handleDragLeave}
                        on:drop={(e) => handleDrop(e, listName)}
                    >
                        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{listName}</h2>
                        <div class="space-y-4">
                            {#each stocks.filter((stock) => stock.list_name === listName) as userStock (userStock.id)}
                                <div 
                                    role="listitem"
                                    class="transform transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <StockItem
                                        item={userStock.metadata}
                                        {userStock}
                                        on:moveItem={handleMoveItem}
                                        on:deleteItem={handleDeleteItem}
                                    />
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        {#if showAddForm}
            <AddStockForm
                {activeList}
                on:close={() => (showAddForm = false)}
                on:stockAdded={handleStockAdded}
            />
        {/if}
    </div>
</div>
