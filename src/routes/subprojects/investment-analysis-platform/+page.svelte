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
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Grid View</span>
                        <label class="toggle-switch">
                            <input type="checkbox" bind:checked={tableView}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Table View</span>
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
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {#each ['Symbol', 'Company Name', 'Sector', 'Current Price', 'Target Price', 'Notes'] as header, index}
                                            <th 
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                on:click={() => {
                                                    if (sortColumn === header) {
                                                        sortDirection *= -1;
                                                    } else {
                                                        sortColumn = header;
                                                        sortDirection = 1;
                                                    }
                                                }}
                                            >
                                                {header}
                                                {#if sortColumn === header}
                                                    {sortDirection === 1 ? '▲' : '▼'}
                                                {/if}
                                            </th>
                                        {/each}
                                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {#each sortedItems as item (item.id)}
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center">
                                                    <img src={`https://assets.parqet.com/logos/symbol/${item.symbol}?format=png`} 
                                                         alt={`${item.symbol} logo`} 
                                                         class="mr-3 h-8 w-8"
                                                         on:error={(e) => {
                                                             if (e.target instanceof HTMLImageElement) {
                                                                 e.target.style.display = 'none';
                                                             }
                                                         }}
                                                    >
                                                    <span class="text-sm text-gray-900 dark:text-gray-100">{item.symbol}</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.company_name}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.sector}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">${item.current_price}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">${item.target_price}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.notes}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    on:click={() => handleFullPage(item)}
                                                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                                                >
                                                    Full Page
                                                </button>
                                                <button
                                                    on:click={() => deleteItem(new CustomEvent('deleteItem', { detail: item.id }))}
                                                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
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

