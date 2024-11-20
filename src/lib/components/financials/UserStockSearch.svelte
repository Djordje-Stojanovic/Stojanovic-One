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

    $: {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredStocks = userStocks.filter(stock => 
                stock.symbol.toLowerCase().includes(term) || 
                stock.company_name.toLowerCase().includes(term)
            );
            showDropdown = true;
        } else {
            filteredStocks = [];
            showDropdown = false;
        }
    }

    async function handleStockSelect(symbol: string) {
        searchTerm = '';
        showDropdown = false;
        
        // Navigate to the new URL and force a page reload
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
    <input
        type="text"
        bind:value={searchTerm}
        placeholder="Search your stocks..."
        class="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    
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
