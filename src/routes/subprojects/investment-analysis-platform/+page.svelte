<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import type { UserStock, StockMetadata } from '$lib/types';
    import type { ListName } from '$lib/constants/listNames';
    import StockItem from '$lib/components/StockItem.svelte';
    import AddStockForm from '$lib/components/AddStockForm.svelte';
    import { listNames } from '$lib/constants/listNames';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import { session } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
    import { moveStock } from '$lib/utils/stockMoves';

    let stocks: UserStock[] = [];
    let loading = true;
    let error: string | null = null;
    let showAddForm = false;
    let hoveredList: ListName | null = null;

    async function fetchStocks() {
        try {
            if (!$session?.user) {
                throw new Error('No authenticated user');
            }

            const { data: stocksData, error: stocksError } = await supabase
                .from('user_stocks')
                .select(`
                    *,
                    stock_metadata!inner (*)
                `)
                .eq('user_id', $session.user.id)
                .order('created_at', { ascending: false });

            if (stocksError) throw stocksError;
            if (!stocksData) throw new Error('No data received');

            stocks = stocksData.map(stock => ({
                id: stock.id,
                user_id: stock.user_id,
                stock_metadata_id: stock.stock_metadata_id,
                list_name: stock.list_name as ListName,
                created_at: stock.created_at,
                updated_at: stock.updated_at,
                notes: stock.notes || undefined,
                metadata: {
                    id: stock.stock_metadata.id,
                    symbol: stock.stock_metadata.symbol,
                    company_name: stock.stock_metadata.company_name,
                    sector: stock.stock_metadata.sector,
                    market_cap: Number(stock.stock_metadata.market_cap),
                    exchange: stock.stock_metadata.exchange,
                    currency: stock.stock_metadata.currency,
                    country: stock.stock_metadata.country,
                    logo_url: stock.stock_metadata.logo_url,
                    parqet_logo_url: stock.stock_metadata.parqet_logo_url,
                    isin: stock.stock_metadata.isin,
                    share_outstanding: stock.stock_metadata.share_outstanding,
                    estimate_currency: stock.stock_metadata.estimate_currency,
                    ipo: stock.stock_metadata.ipo,
                    phone: stock.stock_metadata.phone,
                    weburl: stock.stock_metadata.weburl
                }
            })) as UserStock[];
        } catch (e) {
            console.error('Error fetching stocks:', e);
            error = e instanceof Error ? e.message : 'An unknown error occurred';
            stocks = [];
        } finally {
            loading = false;
        }
    }

    $: if (!$session) {
        goto('/login');
    } else if ($session && loading) {
        fetchStocks();
    }

    const handleStockAdded = (event: CustomEvent<UserStock>) => {
        const newStock = event.detail;
        stocks = [newStock, ...stocks];
        showAddForm = false;
    };

    const handleStockUpdated = (event: CustomEvent<UserStock>) => {
        const updatedStock = event.detail;
        stocks = stocks.map((stock) =>
            stock.id === updatedStock.id ? updatedStock : stock
        );
    };

    const handleStockDeleted = (event: CustomEvent<string>) => {
        const id = event.detail;
        stocks = stocks.filter((stock) => stock.id !== id);
    };

    const handleDragOver = (e: DragEvent, listName: ListName) => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        hoveredList = listName;
    };

    const handleDragLeave = () => {
        hoveredList = null;
    };

    async function updateStockList(stockId: string, newListName: ListName) {
        try {
            const { data, error: moveError } = await moveStock(stockId, newListName);
            if (moveError) throw moveError;

            if (data) {
                // Update the local state
                stocks = stocks.map((s) =>
                    s.id === stockId ? data : s
                );
                console.log('Updated stocks:', stocks);
            }
        } catch (error) {
            console.error('Error updating stock list:', error);
            alert('Failed to move stock. Please try again.');
        }
    }

    const handleDrop = async (e: DragEvent, newListName: ListName) => {
        e.preventDefault();
        const stockId = e.dataTransfer?.getData('text/plain');
        if (!stockId || !$session?.user) return;

        await updateStockList(stockId, newListName);
        hoveredList = null;
    };

    const handleMoveItem = async (event: CustomEvent<{ stockId: string, newListName: ListName }>) => {
        const { stockId, newListName } = event.detail;
        await updateStockList(stockId, newListName);
    };
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8">
        <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Investment Analysis Platform</h1>
                <button
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    on:click={() => (showAddForm = !showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add Stock'}
                </button>
            </div>
        </div>

        {#if showAddForm}
            <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <AddStockForm on:stockAdded={handleStockAdded} activeList="Watchlist" />
            </div>
        {/if}

        {#if loading}
            <div class="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        {:else if error}
            <div class="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-4 rounded-lg text-center">
                {error}
            </div>
        {:else}
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {#each [...listNames] as listName}
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 {hoveredList === listName ? 'ring-2 ring-blue-500' : ''}"
                        role="list"
                        on:dragover={(e) => handleDragOver(e, listName)}
                        on:dragleave={handleDragLeave}
                        on:drop={(e) => handleDrop(e, listName)}
                    >
                        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{listName}</h2>
                        <div class="space-y-4">
                            {#each stocks.filter((stock) => stock.list_name === listName) as stock (stock.id)}
                                {#if stock.metadata}
                                    <div 
                                        role="listitem"
                                        class="transform transition-transform duration-300 hover:-translate-y-1"
                                    >
                                        <StockItem
                                            item={stock.metadata}
                                            userStock={stock}
                                            on:stockUpdated={handleStockUpdated}
                                            on:deleteItem={handleStockDeleted}
                                            on:moveItem={handleMoveItem}
                                        />
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
