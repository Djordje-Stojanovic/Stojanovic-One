<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import { session } from '$lib/stores/sessionStore';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import AddStockForm from '$lib/components/AddStockForm.svelte';
    import CompanyInfoCard from '$lib/components/CompanyInfoCard.svelte';
    import { browser } from '$app/environment';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import StockItem from '$lib/components/StockItem.svelte';
    import { listNames } from '$lib/constants/listNames';
    import '../../../app.css';

    interface StockItem {
        id: string;
        symbol: string;
        company_name: string;
        sector: string;
        current_price: number;
        target_price: number;
        notes: string;
        list_name: string;
    }

    let activeSection = 'Watchlist';
    let items: StockItem[] = [];
    let loading = true;
    let showAddStockForm = false;
    let selectedStockId: string | null = null;

    let activeList = listNames[0];
    let lists = listNames;
    let tableView = false;

    let sortColumn = '';
    let sortDirection = 1; // 1 for ascending, -1 for descending

    $: {
        if (browser) {
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
    }

    $: filteredItems = items.filter(item => item.list_name === activeSection);

    $: sortedItems = filteredItems.sort((a, b) => {
        const aValue = a[sortColumn.toLowerCase().replace(' ', '_')] || '';
        const bValue = b[sortColumn.toLowerCase().replace(' ', '_')] || '';
        return sortDirection * (aValue > bValue ? 1 : -1);
    });

    onMount(async () => {
        await loadItems();
    });

    async function loadItems() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                if (browser) {
                    goto('/login?redirected=true&from=/subprojects/investment-analysis-platform');
                }
                return;
            }

            const { data, error } = await supabase
                .from('stock_items')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) throw error;

            items = data;
            loading = false;
        } catch (e) {
            console.error('Error loading items:', e);
            loading = false;
        }
    }

    async function addNewItem(newItem: StockItem) {
        try {
            const { data, error } = await supabase
                .from('stock_items')
                .insert([newItem])
                .select();

            if (error) throw error;

            items = [...items, data[0]];
        } catch (e) {
            console.error('Error adding new item:', e);
            throw e;
        }
    }

    async function moveItem(event: CustomEvent<{ item: any; newListName: string }>) {
        const { item, newListName } = event.detail;
        if (!newListName) return;

        try {
            const { data: updatedStockItem, error } = await supabase
                .from('stock_items')
                .update({ list_name: newListName })
                .eq('id', item.id)
                .select()
                .single();

            if (error) throw error;
            items = items.map(i => i.id === item.id ? updatedStockItem : i);

            const { error: answersError } = await supabase
                .from('stock_answers')
                .update({ list_name: newListName })
                .eq('stock_item_id', item.id);

            if (answersError) throw answersError;

            goto(
                `/subprojects/investment-analysis-platform/${encodeURIComponent(newListName)}/${encodeURIComponent(
                    item.symbol.toLowerCase()
                )}`
            );
        } catch (e) {
            console.error('Error moving item:', e);
            alert('Failed to move item');
        }
    }

    async function deleteItem(event: CustomEvent<string>) {
        const itemId = event.detail;
        if (!itemId) {
            console.error('No item ID provided for deletion');
            return;
        }
        try {
            const { error } = await supabase
                .from('stock_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;

            items = items.filter(item => item.id !== itemId);
        } catch (e) {
            console.error('Error deleting item:', e);
            alert('Failed to delete item');
        }
    }

    function handleSectionChange(newSection: string) {
        activeSection = newSection;
    }

    function handleStockAdded(event) {
        items = [...items, event.detail];
        showAddStockForm = false;
    }

    function handleFullPage(item: StockItem) {
        goto(`/subprojects/investment-analysis-platform/${encodeURIComponent(item.list_name.toLowerCase())}/${encodeURIComponent(item.symbol.toLowerCase())}`);
    }

    function handleSort(column) {
        if (sortColumn === column) {
            sortDirection *= -1;
        } else {
            sortColumn = column;
            sortDirection = 1;
        }
    }

    function handleDelete(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(itemId);
        }
    }
</script>

<svelte:head>
    <title>Investment Analysis Platform</title>
</svelte:head>

{#if $session}
    <div class="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar {activeSection} onSectionChange={handleSectionChange} />
        <div class="flex-1 p-8">
            <div class="mb-8 flex items-center justify-between">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">Investment Analysis Platform</h1>
                <div class="flex items-center space-x-4">
                    {#if activeSection === 'Watchlist'}
                        <button
                            on:click={() => showAddStockForm = true}
                            class="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            Add New Stock
                        </button>
                    {/if}
                    <div class="flex items-center justify-end mb-4">
                        <span class="text-sm font-medium text-gray-400 dark:text-gray-300 mr-3">Grid View</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" bind:checked={tableView} class="sr-only peer">
                            <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                        <span class="text-sm font-medium text-gray-400 dark:text-gray-300 ml-3">Table View</span>
                    </div>
                </div>
            </div>
            <main>
                {#if loading}
                    <div class="flex items-center justify-center">
                        <LoadingSpinner size="w-12 h-12" />
                    </div>
                {:else}
                    {#if filteredItems.length === 0}
                        <p class="text-center text-gray-500 dark:text-gray-400">No items in this list.</p>
                    {:else}
                        {#if tableView}
                            <div class="overflow-x-auto shadow-md sm:rounded-lg">
                                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            {#each ['Symbol', 'Company Name', 'Sector', 'Current Price', 'Target Price', 'Notes'] as header, index}
                                                <th scope="col" class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" on:click={() => handleSort(header)}>
                                                    <div class="flex items-center justify-between">
                                                        {header}
                                                        {#if sortColumn === header}
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
                                        {#each sortedItems as item (item.id)}
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <img src="https://assets.parqet.com/logos/symbol/{item.symbol}?format=png" alt="{item.symbol} logo" class="w-8 h-8 mr-3 rounded-full">
                                                        <span class="font-medium text-gray-900 dark:text-white">{item.symbol}</span>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">{item.company_name}</td>
                                                <td class="px-6 py-4 whitespace-nowrap">{item.sector}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-right">${item.current_price}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-right">${item.target_price}</td>
                                                <td class="px-6 py-4">{item.notes}</td>
                                                <td class="px-6 py-4 text-right">
                                                    <button on:click={() => handleFullPage(item)} class="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2">Full Page</button>
                                                    <button on:click={() => handleDelete(item.id)} class="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {:else}
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {#each filteredItems as item (item.id)}
                                    <StockItem {item} on:moveItem={moveItem} on:deleteItem={deleteItem} />
                                {/each}
                            </div>
                        {/if}
                    {/if}
                {/if}
            </main>
            {#if showAddStockForm && activeSection === 'Watchlist'}
                <AddStockForm {activeList} on:stockAdded={handleStockAdded} on:close={() => showAddStockForm = false} />
            {/if}
        </div>
    </div>
    {#if selectedStockId}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
                <CompanyInfoCard stockItemId={selectedStockId} />
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