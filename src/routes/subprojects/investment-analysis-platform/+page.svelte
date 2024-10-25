<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import AddStockForm from '$lib/components/AddStockForm.svelte';
    import StockItem from '$lib/components/StockItem.svelte';
    import type { ListName } from '$lib/constants/listNames';
    import { session } from '$lib/stores/sessionStore';
    import type { UserStock } from '$lib/types';

    let showAddForm = false;
    let stocks: UserStock[] = [];
    let loading = true;
    let error: string | null = null;
    let activeList: ListName = 'Watchlist';
    let isSyncing = false;
    let syncError: string | null = null;
    let syncResult: string | null = null;

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
        } catch (e) {
            console.error('Error syncing symbols:', e);
            syncError = e instanceof Error ? e.message : 'An unknown error occurred';
        } finally {
            isSyncing = false;
        }
    }

    onMount(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('user_stocks')
                .select(`
                    *,
                    metadata:stock_metadata (*)
                `)
                .eq('user_id', $session?.user?.id)
                .eq('list_name', activeList);

            if (fetchError) throw fetchError;
            stocks = data || [];
        } catch (e) {
            console.error('Error fetching stocks:', e);
            error = e instanceof Error ? e.message : 'Failed to fetch stocks';
        } finally {
            loading = false;
        }
    });

    function handleStockAdded(event: CustomEvent<UserStock>) {
        stocks = [...stocks, event.detail];
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
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {#each stocks as userStock (userStock.id)}
                    <StockItem 
                        item={userStock.metadata} 
                        {userStock}
                    />
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
