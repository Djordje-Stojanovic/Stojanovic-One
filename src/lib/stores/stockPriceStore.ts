import { writable, derived } from 'svelte/store';
import type { StockPrice, StockPriceData } from '$lib/types/stockPrices';

interface StockPriceState {
    allData: StockPriceData | null;
    filteredData: StockPrice[];
    loading: boolean;
    error: string | null;
    dateRange: {
        from: string | null;
        to: string | null;
    };
}

const initialState: StockPriceState = {
    allData: null,
    filteredData: [],
    loading: false,
    error: null,
    dateRange: {
        from: null,
        to: null
    }
};

function createStockPriceStore() {
    const { subscribe, set, update } = writable<StockPriceState>(initialState);

    return {
        subscribe,
        setData: (data: StockPriceData) => update(state => {
            const filteredData = data.historical.filter(price => {
                if (!state.dateRange.from && !state.dateRange.to) return true;
                const priceDate = new Date(price.date);
                const fromDate = state.dateRange.from ? new Date(state.dateRange.from) : null;
                const toDate = state.dateRange.to ? new Date(state.dateRange.to) : null;
                
                if (fromDate && toDate) {
                    return priceDate >= fromDate && priceDate <= toDate;
                } else if (fromDate) {
                    return priceDate >= fromDate;
                } else if (toDate) {
                    return priceDate <= toDate;
                }
                return true;
            });

            return {
                ...state,
                allData: data,
                filteredData
            };
        }),
        setDateRange: (from: string | null, to: string | null) => update(state => {
            if (!state.allData) return state;

            const filteredData = state.allData.historical.filter(price => {
                if (!from && !to) return true;
                const priceDate = new Date(price.date);
                const fromDate = from ? new Date(from) : null;
                const toDate = to ? new Date(to) : null;
                
                if (fromDate && toDate) {
                    return priceDate >= fromDate && priceDate <= toDate;
                } else if (fromDate) {
                    return priceDate >= fromDate;
                } else if (toDate) {
                    return priceDate <= toDate;
                }
                return true;
            });

            return {
                ...state,
                dateRange: { from, to },
                filteredData
            };
        }),
        setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
        setError: (error: string | null) => update(state => ({ ...state, error })),
        reset: () => set(initialState)
    };
}

export const stockPriceStore = createStockPriceStore();

// Derived stores for convenient access
export const filteredPrices = derived(stockPriceStore, $store => $store.filteredData);
export const loading = derived(stockPriceStore, $store => $store.loading);
export const error = derived(stockPriceStore, $store => $store.error);
export const dateRange = derived(stockPriceStore, $store => $store.dateRange);

// Derived calculations
export const latestPrice = derived(stockPriceStore, $store => {
    if (!$store.filteredData.length) return null;
    return $store.filteredData[0];
});

export const priceStats = derived(stockPriceStore, $store => {
    if (!$store.filteredData.length) return null;

    const prices = $store.filteredData;
    
    // Filter out null values before calculations
    const validHighs = prices.map(p => p.high).filter((h): h is number => h !== null);
    const validLows = prices.map(p => p.low).filter((l): l is number => l !== null);
    const validVolumes = prices.map(p => p.volume);

    // Get first and last valid close prices for price change calculation
    const firstValidClose = prices.find(p => p.close !== null)?.close;
    const lastValidClose = [...prices].reverse().find(p => p.close !== null)?.close;

    const highest = validHighs.length ? Math.max(...validHighs) : null;
    const lowest = validLows.length ? Math.min(...validLows) : null;
    const avgVolume = validVolumes.length 
        ? Math.round(validVolumes.reduce((a, b) => a + b, 0) / validVolumes.length)
        : 0;

    let priceChange = null;
    let priceChangePercent = null;

    if (firstValidClose !== null && firstValidClose !== undefined && 
        lastValidClose !== null && lastValidClose !== undefined) {
        priceChange = firstValidClose - lastValidClose;
        priceChangePercent = ((firstValidClose - lastValidClose) / lastValidClose) * 100;
    }

    return {
        highest,
        lowest,
        avgVolume,
        priceChange,
        priceChangePercent
    };
});
