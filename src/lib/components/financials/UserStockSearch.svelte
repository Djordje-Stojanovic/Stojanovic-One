<script lang="ts">
    import { goto } from '$app/navigation';
    import { db } from '$lib/supabaseClient';
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
    let filteredStocks: Array<{symbol: string, company_name: string}> = [];
    let showDropdown = false;
    let loading = false;
    let selectedIndex = -1;
    let searchInput: HTMLInputElement;

    async function searchStocks(term: string) {
        loading = true;
        try {
            const { data, error } = await db
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
            searchStocks(searchTerm).then(results => {
                filteredStocks = results;
                showDropdown = true;
                selectedIndex = -1; // Reset selection when results change
            });
        } else {
            filteredStocks = [];
            showDropdown = false;
            selectedIndex = -1;
        }
    }

    async function handleStockSelect(symbol: string) {
        searchTerm = '';
        showDropdown = false;
        selectedIndex = -1;
        
        await goto(`/subprojects/investment-analysis-platform/company/${symbol}/financials`, {
            invalidateAll: true
        });
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!showDropdown || filteredStocks.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                selectedIndex = (selectedIndex + 1) % filteredStocks.length;
                break;
            case 'ArrowUp':
                event.preventDefault();
                selectedIndex = selectedIndex <= 0 ? filteredStocks.length - 1 : selectedIndex - 1;
                break;
            case 'Tab':
                event.preventDefault();
                selectedIndex = (selectedIndex + 1) % filteredStocks.length;
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0) {
                    handleStockSelect(filteredStocks[selectedIndex].symbol);
                }
                break;
            case 'Escape':
                event.preventDefault();
                showDropdown = false;
                selectedIndex = -1;
                searchInput?.blur();
                break;
        }
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.search-container')) {
            showDropdown = false;
            selectedIndex = -1;
        }
    }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="search-container relative w-full max-w-md">
    <div class="relative">
        <input
            bind:this={searchInput}
            type="text"
            bind:value={searchTerm}
            on:keydown={handleKeydown}
            placeholder="Search any stock symbol or company name..."
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
            {#each filteredStocks as stock, i}
                <button
                    class="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex flex-col {i === selectedIndex ? 'bg-gray-700' : ''}"
                    on:click={() => handleStockSelect(stock.symbol)}
                    on:mouseenter={() => selectedIndex = i}
                >
                    <span class="font-semibold">{stock.symbol}</span>
                    <span class="text-sm text-gray-400">{stock.company_name}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>
