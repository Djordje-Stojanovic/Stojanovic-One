<script lang="ts">
    import { investmentStore } from '$lib/stores/investmentStore';
    import StockItem from '../StockItem.svelte';
    import type { ListName } from '$lib/constants/listNames';
    import { listNames } from '$lib/constants/listNames';
    import { allowedMoves } from '$lib/utils/stockMoves';
    import type { UserStock } from '$lib/types';
    import { goto } from '$app/navigation';
    import StockPageButton from '../StockPageButton.svelte';

    export let isCompactView: boolean;

    function handleDragOver(e: DragEvent, listName: ListName) {
        e.preventDefault();
        if (!e.dataTransfer) return;
        
        if ($investmentStore.dragSourceList && allowedMoves[$investmentStore.dragSourceList]?.includes(listName)) {
            e.dataTransfer.dropEffect = 'move';
            investmentStore.setHoveredList(listName);
        } else {
            e.dataTransfer.dropEffect = 'none';
            investmentStore.setHoveredList(null);
        }
    }

    function handleDragLeave() {
        investmentStore.setHoveredList(null);
    }

    async function handleDrop(e: DragEvent, newListName: ListName) {
        e.preventDefault();
        investmentStore.setHoveredList(null);
        investmentStore.setDragSourceList(null);
        
        if (!e.dataTransfer) return;
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
            const stockId = dragData.id;
            await investmentStore.moveStock(stockId, newListName);
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }

    function isValidDropTarget(listName: ListName): boolean {
        return $investmentStore.dragSourceList ? 
            allowedMoves[$investmentStore.dragSourceList]?.includes(listName) ?? false : 
            false;
    }

    async function handleDeleteItem(event: CustomEvent<string>) {
        try {
            await investmentStore.deleteStock(event.detail);
        } catch (error) {
            console.error('Error deleting stock:', error);
            alert('Failed to delete stock. Please try again.');
        }
    }

    function handleSelectChange(e: Event, stockId: string) {
        const select = e.target as HTMLSelectElement;
        const newListName = select.value as ListName;
        if (newListName) {
            investmentStore.moveStock(stockId, newListName);
            select.value = ''; // Reset select
        }
    }

    function navigateToFullPage(symbol: string, listName: string) {
        goto(`/subprojects/investment-analysis-platform/${listName.toLowerCase()}/${symbol.toLowerCase()}`);
    }

    $: stocksByList = listNames.reduce((acc, listName) => {
        acc[listName] = $investmentStore.stocks.filter(stock => stock.list_name === listName);
        return acc;
    }, {} as Record<ListName, UserStock[]>);

    const buttonClasses = "px-2 py-1 text-xs font-medium rounded shadow-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
</script>

{#if $investmentStore.loading}
    <div class="flex justify-center items-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
    </div>
{:else if $investmentStore.error}
    <div class="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-800 dark:text-red-100 transition-colors duration-300">
        {$investmentStore.error}
    </div>
{:else if $investmentStore.stocks.length === 0}
    <div class="text-center text-gray-600 dark:text-gray-400 transition-colors duration-300 py-12">
        No stocks added yet. Click "Add Stock" to get started.
    </div>
{:else}
    {#if isCompactView}
        <!-- Table View -->
        <div class="grid grid-cols-1 gap-6">
            {#each [...listNames] as listName (listName)}
                {#if stocksByList[listName].length > 0}
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-700 transition-all duration-300">
                        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{listName}</h2>
                            <span class="px-2 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                {stocksByList[listName].length} {stocksByList[listName].length === 1 ? 'stock' : 'stocks'}
                            </span>
                        </div>
                        <div class="overflow-y-auto max-h-[calc(100vh-44rem)]">
                            <div class="min-w-full align-middle inline-block">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                        <tr>
                                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">Symbol</th>
                                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[25%]">Company</th>
                                            <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[20%]">Market Cap</th>
                                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">Exchange</th>
                                            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[25%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                        {#each stocksByList[listName] as userStock (userStock.id)}
                                            {#if userStock.metadata}
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                                    <td class="px-3 py-2 whitespace-nowrap">
                                                        <button 
                                                            class="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                                                            on:click={() => navigateToFullPage(userStock.metadata.symbol, listName)}
                                                        >
                                                            <img src={userStock.metadata.logo_url} alt="" class="h-5 w-5 mr-2">
                                                            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{userStock.metadata.symbol}</span>
                                                        </button>
                                                    </td>
                                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {userStock.metadata.company_name}
                                                    </td>
                                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                                                        ${userStock.metadata.market_cap?.toLocaleString() ?? 'N/A'}
                                                    </td>
                                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {userStock.metadata.exchange}
                                                    </td>
                                                    <td class="px-3 py-2 whitespace-nowrap">
                                                        <div class="flex items-center gap-2">
                                                            <select 
                                                                class="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 focus:outline-none focus:ring-1 transition-colors duration-300"
                                                                on:change={(e) => handleSelectChange(e, userStock.id)}
                                                                aria-label="Move stock to different list"
                                                            >
                                                                <option value="">Move to...</option>
                                                                {#each allowedMoves[userStock.list_name] || [] as moveOption}
                                                                    <option value={moveOption}>{moveOption}</option>
                                                                {/each}
                                                            </select>
                                                            <button
                                                                class="{buttonClasses} bg-gray-600 hover:bg-gray-700 text-white"
                                                                on:click={() => navigateToFullPage(userStock.metadata.symbol, listName)}
                                                                aria-label="View full page for {userStock.metadata.symbol}"
                                                            >
                                                                Full Page
                                                            </button>
                                                            <button
                                                                class="{buttonClasses} bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                on:click={() => goto(`/subprojects/investment-analysis-platform/company/${userStock.metadata.symbol}`)}
                                                                aria-label="View wiki for {userStock.metadata.symbol}"
                                                            >
                                                                Wiki
                                                            </button>
                                                            <button
                                                                class="{buttonClasses} bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                on:click={() => goto(`/subprojects/investment-analysis-platform/company/${userStock.metadata.symbol}/financials`)}
                                                                aria-label="View financials for {userStock.metadata.symbol}"
                                                            >
                                                                Financials
                                                            </button>
                                                            <button
                                                                class="{buttonClasses} bg-red-600 hover:bg-red-700 text-white"
                                                                on:click={() => handleDeleteItem(new CustomEvent('deleteItem', { detail: userStock.id }))}
                                                                aria-label="Delete {userStock.metadata.symbol} from list"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            {/if}
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    {:else}
        <!-- Kanban View -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each [...listNames] as listName (listName)}
                <div
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 
                        {$investmentStore.dragSourceList && isValidDropTarget(listName) ? 'ring-2 ring-blue-500/50 shadow-md bg-blue-50/30 dark:bg-blue-900/10' : ''} 
                        {$investmentStore.hoveredList === listName ? '!ring-2 !ring-blue-500 !shadow-lg !scale-[1.02] !bg-blue-50/50 dark:!bg-blue-900/20' : ''}"
                    role="list"
                    on:dragover={(e) => handleDragOver(e, listName)}
                    on:dragleave={handleDragLeave}
                    on:drop={(e) => handleDrop(e, listName)}
                >
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{listName}</h2>
                        <span class="px-2 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {stocksByList[listName].length} {stocksByList[listName].length === 1 ? 'stock' : 'stocks'}
                        </span>
                    </div>
                    <div class="space-y-4 h-[calc(100vh-36rem)] overflow-y-auto pr-2">
                        {#each stocksByList[listName] as userStock (userStock.id)}
                            <div 
                                role="listitem"
                                class="transform transition-transform duration-300 hover:-translate-y-1"
                            >
                                <StockItem
                                    item={userStock.metadata}
                                    userStock={userStock}
                                    on:moveItem={({ detail }) => investmentStore.moveStock(detail.stockId, detail.newListName)}
                                    on:deleteItem={handleDeleteItem}
                                    on:dragStart={(e) => investmentStore.setDragSourceList(e.detail)}
                                    on:dragEnd={() => {
                                        investmentStore.setDragSourceList(null);
                                        investmentStore.setHoveredList(null);
                                    }}
                                />
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/if}
