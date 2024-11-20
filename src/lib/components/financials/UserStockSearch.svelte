<script lang="ts">
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { session } from '$lib/stores/sessionStore';
    import { invalidate } from '$app/navigation';
    
    interface StockMetadata {
        symbol: string;
        company_name: string;
    }

    interface UserStockResponse {
        stock_metadata: StockMetadata;
    }

    let searchTerm = '';
    let userStocks: Array<{symbol: string, company_name: string}> = [];
    let filteredStocks: Array<{symbol: string, company_name: string}> = [];
    let showDropdown = false;
    let searchGlobal = false;
    let loading = false;

    onMount(async () => {
        if ($session) {
            const { data, error } = await supabase
                .from('user_stocks')
                .select(`
                    stock_metadata:stock_metadata_id (
                        symbol,
                        company_name
                    )
                `)
                .eq('user_id', $session.user.id);

            if (!error && data) {
                const stocksData = data as unknown as UserStockResponse[];
                userStocks = stocksData
                    .map(stock => ({
                        symbol: stock.stock_metadata.symbol,
                        company_name: stock.stock_metadata.company_name
                    }))
                    .filter((stock): stock is {symbol: string, company_name: string} => 
                        stock.symbol !== null && stock.company_name !== null
                    );
            }
        }
    });

    async function searchGlobalStocks(term: string) {
        loading = true;
        try {
            const { data, error } = await supabase
                .from('stock_metadata')
                .select('symbol, company_name')
                .or(`symbol.ilike.%${term}%,company_name.ilike.%${term}%`)
                .limit(10);

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error searching stocks:', err);
            return [];
        } finally {
            loading = false;
        }
    }

    $: {
        if (searchTerm) {
            if (searchGlobal) {
                searchGlobalStocks(searchTerm).then(results => {
                    filteredStocks = results;
                    showDropdown = true;
                });
            } else {
                const term = searchTerm.toLowerCase();
                filteredStocks = userStocks.filter(stock => 
                    stock.symbol.toLowerCase().includes(term) || 
                    stock.company_name.toLowerCase().includes(term)
                );
                showDropdown = true;
            }
        } else {
            filteredStocks = [];
            showDropdown = false;
        }
    }

    async function handleStockSelect(symbol: string) {
        searchTerm = '';
        showDropdown = false;
        
        await goto(`/subprojects/investment-analysis-platform/company/${symbol}/financials`, {
            invalidateAll: true
        });
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.search-container')) {
            showDropdown = false;
        }
    }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="search-container relative w-full max-w-md">
    <div class="flex items-center gap-4 mb-2">
        <label class="flex items-center cursor-pointer select-none">
            <div class="relative">
                <input
                    type="checkbox"
                    bind:checked={searchGlobal}
                    class="sr-only"
                >
                <div class="w-10 h-6 bg-gray-700 rounded-full shadow-inner"></div>
                <div class="dot absolute w-4 h-4 bg-white rounded-full transition transform {searchGlobal ? 'translate-x-5' : 'translate-x-1'} top-1"></div>
            </div>
            <span class="ml-2 text-sm text-gray-300">
                {searchGlobal ? 'Search All Stocks' : 'Search Your Stocks'}
            </span>
        </label>
    </div>

    <div class="relative">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder={searchGlobal ? "Search all stocks..." : "Search your stocks..."}
            class="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {#if loading}
            <div class="absolute right-3 top-2.5">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
        {/if}
    </div>
    
    {#if showDropdown && filteredStocks.length > 0}
        <div class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
            {#each filteredStocks as stock}
                <button
                    class="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex flex-col"
                    on:click={() => handleStockSelect(stock.symbol)}
                >
                    <span class="font-semibold">{stock.symbol}</span>
                    <span class="text-sm text-gray-400">{stock.company_name}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .dot {
        transition: transform 0.3s ease-in-out;
    }
</style>
