<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { session } from '$lib/stores/sessionStore';
    import { browser } from '$app/environment';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import AddStockForm from '$lib/components/AddStockForm.svelte';
    import Company from '$lib/components/CompanyInfoCard.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import StockItem from '$lib/components/StockItem.svelte';
    import { listNames, type ListName } from '$lib/constants/listNames';
    import { allowedMoves } from '$lib/utils/stockMoves';
    import '../../../app.css';

    interface StockMetadata {
        id: string;
        symbol: string;
        company_name: string;
        sector: string;
        market_cap: number;
        exchange: string;
        parqet_logo_url: string;
        logo_url: string;
    }

    interface UserStock {
        id: string;
        user_id: string;
        notes: string;
        list_name: ListName;
    }

    interface StockItem {
        userStock: UserStock;
        stockMetadata: StockMetadata;
    }

    let activeSection = 'Watchlist';
    let items: StockItem[] = [];
    let loading = true;
    let showAddStockForm = false;
    let selectedStockId: string | null = null;

    let activeList: string = listNames[0];
    let lists = listNames;
    let tableView = false;

    let sortColumn = 'symbol'; // Default sort column
    let sortDirection = 1;     // 1 for ascending, -1 for descending

    // Update activeSection based on URL if necessary
    $: if (browser) {
        const url = new URL(window.location.href);
        const queryList = url.searchParams.get('list');
        if (queryList) {
            const matchedList = listNames.find(
                (list) => list.toLowerCase() === queryList.toLowerCase()
            );
            if (matchedList) {
                activeList = matchedList;
                activeSection = matchedList;
            }
        }
    }
    // Filter items based on the active section
    $: filteredItems = items.filter(item => item?.userStock?.list_name === activeSection);

    // Sort the filtered items
    $: sortedItems = filteredItems.slice().sort((a, b) => {
        const aValue = a?.stockMetadata?.[sortColumn] ?? '';
        const bValue = b?.stockMetadata?.[sortColumn] ?? '';
        return sortDirection * (aValue > bValue ? 1 : -1);
    });

    onMount(async () => {
        await loadItems();
    });

    async function loadItems() {
        try {
            const { data: { session: userSession } } = await supabase.auth.getSession();
            if (!userSession) {
                if (browser) {
                    goto('/login?redirected=true&from=/subprojects/investment-analysis-platform');
                }
                return;
            }

            const { data, error } = await supabase
                .from('user_stocks')
                .select(`
                    *,
                    stock_metadata (*)
                `)
                .eq('user_id', userSession.user.id);

            if (error) throw error;

            items = data.map(record => ({
                userStock: {
                    id: record.id,
                    user_id: record.user_id,
                    notes: record.notes,
                    list_name: record.list_name,
                },
                stockMetadata: record.stock_metadata,
            }));

            loading = false;
        } catch (error) {
            console.error('Error loading items:', error);
            loading = false;
        }
    }

    function handleSort(column) {
        if (sortColumn === column) {
            sortDirection *= -1;
        } else {
            sortColumn = column;
            sortDirection = 1;
        }
    }

    // Implement the moveItem function
    async function moveItem(event) {
        const { userStock, newListName } = event.detail;
        try {
            const { data, error } = await supabase
                .from('user_stocks')
                .update({ list_name: newListName })
                .eq('id', userStock.id);

            if (error) throw error;

            // Update the local items array
            items = items.map(item => {
                if (item.userStock.id === userStock.id) {
                    return {
                        ...item,
                        userStock: { ...item.userStock, list_name: newListName }
                    };
                }
                return item;
            });

            // Optionally, you can also update the UI to reflect the move
            // For example, you might want to remove the item from the current list
        } catch (error) {
            console.error('Error moving item:', error);
        }
    }

    // Implement the deleteItem function
    async function deleteItem(event) {
        const userStockId = event.detail;
        try {
            const { data, error } = await supabase
                .from('user_stocks')
                .delete()
                .eq('id', userStockId);

            if (error) throw error;

            // Remove the item from the local items array
            items = items.filter(item => item.userStock.id !== userStockId);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }

    function handleStockAdded() {
        showAddStockForm = false;
        loadItems();
    }

    function handleFullPage(userStock: UserStock, stockMetadata: StockMetadata) {
        goto(`/subprojects/investment-analysis-platform/${encodeURIComponent(userStock.list_name.toLowerCase())}/${encodeURIComponent(stockMetadata.symbol.toLowerCase())}`);
    }
</script>

<svelte:head>
    <title>Investment Analysis Platform</title>
</svelte:head>

{#if $session}
    <div class="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar bind:activeSection onSectionChange={(section) => activeSection = section} />
        <div class="flex-1 p-8">
            <div class="mb-8 flex items-center justify-between">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">Investment Analysis Platform</h1>
                <div class="flex items-center space-x-4">
                    {#if activeSection === 'Watchlist'}
                        <button
                            class="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            on:click={() => (showAddStockForm = true)}
                        >
                            Add New Stock
                        </button>
                    {/if}
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-400 dark:text-gray-300 mr-3">Grid View</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" bind:checked={tableView}>
                            <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer
                                        dark:bg-gray-700 peer-checked:bg-blue-600">
                                <div
                                    class="absolute left-1 top-1 bg-white h-5 w-5 rounded-full transition-transform duration-200"
                                    style="transform: translateX({tableView ? '28px' : '0px'})"
                                ></div>
                            </div>
                        </label>
                        <span class="text-sm font-medium text-gray-400 dark:text-gray-300 ml-3">Table View</span>
                    </div>
                </div>
            </div>
            <main>
                {#if loading}
                    <div class="flex justify-center">
                        <LoadingSpinner />
                    </div>
                {:else}
                    {#if sortedItems.length === 0}
                        <p class="text-center text-gray-500 dark:text-gray-400">No items in this list.</p>
                    {:else}
                        {#if tableView}
                            <!-- Table View Implementation -->
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            {#each ['Symbol', 'Company Name', 'Sector', 'Market Cap', 'Exchange'] as header}
                                                <th
                                                    scope="col"
                                                    class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    on:click={() => handleSort(header.toLowerCase().replace(' ', '_'))}
                                                >
                                                    <div class="flex items-center justify-between">
                                                        {header}
                                                        {#if sortColumn === header.toLowerCase().replace(' ', '_')}
                                                            <span class="ml-1">{sortDirection === 1 ? '▲' : '▼'}</span>
                                                        {/if}
                                                    </div>
                                                </th>
                                            {/each}
                                            <th scope="col" class="px-6 py-3">
                                                <span class="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each sortedItems as { userStock, stockMetadata } (userStock.id)}
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <img
                                                            src={stockMetadata.parqet_logo_url || stockMetadata.logo_url}
                                                            alt="{stockMetadata.symbol} logo"
                                                            class="w-8 h-8 mr-3 rounded-full"
                                                        >
                                                        <span class="font-medium text-gray-900 dark:text-white">{stockMetadata.symbol}</span>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">{stockMetadata.company_name}</td>
                                                <td class="px-6 py-4 whitespace-nowrap">{stockMetadata.sector}</td>
                                                <td class="px-6 py-4 whitespace-nowrap">${stockMetadata.market_cap.toLocaleString()}</td>
                                                <td class="px-6 py-4 whitespace-nowrap">{stockMetadata.exchange}</td>
                                                <td class="px-6 py-4 text-right">
                                                    <button on:click={() => handleFullPage(userStock, stockMetadata)} class="rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                                                        Full Page
                                                    </button>
                                                    <button on:click={() => deleteItem(userStock.id)} class="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {:else}
                            <!-- Grid View Implementation -->
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {#each sortedItems as { userStock, stockMetadata } (userStock.id)}
                                    <StockItem
                                        {userStock}
                                        item={stockMetadata}
                                        on:moveItem={moveItem}
                                        on:deleteItem={deleteItem}
                                    />
                                {/each}
                            </div>
                        {/if}
                    {/if}
                {/if}
            </main>
            {#if showAddStockForm && activeSection === 'Watchlist'}
                <AddStockForm
                    activeList={activeSection}
                    on:stockAdded={handleStockAdded}
                    on:close={() => (showAddStockForm = false)}
                />
            {/if}
        </div>
    </div>
    {#if selectedStockId}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
                {#if selectedStockId}
                    {#await import('$lib/components/CompanyInfoCard.svelte') then module}
                        <svelte:component this={module.default} stockItemId={selectedStockId} />
                    {/await}
                {/if}
                <button
                    on:click={() => (selectedStockId = null)}
                    class="mt-4 rounded bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
                >
                    Close
                </button>
            </div>
        </div>
    {/if}
{:else}
    <div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div class="text-center">
            <h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                Investment Analysis Platform
            </h1>
            <p class="text-xl text-gray-700 dark:text-gray-300">
                Please log in to access the Investment Analysis Platform.
            </p>
        </div>
    </div>
{/if}