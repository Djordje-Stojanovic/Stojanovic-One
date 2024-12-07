import { db } from '$lib/supabaseClient';
import type { StockPrice, StockPriceData } from '$lib/types/stockPrices';

export async function loadStockPrices(
    symbol: string,
    sessionToken: string,
    from?: string,
    to?: string,
    forceRefresh = false
): Promise<{ data: StockPriceData | null; error: string | null }> {
    try {
        const url = new URL(`/api/stock-prices/${symbol}`, window.location.origin);
        if (forceRefresh) {
            url.searchParams.set('forceRefresh', 'true');
        }
        if (from) {
            url.searchParams.set('from', from);
        }
        if (to) {
            url.searchParams.set('to', to);
        }

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error('Invalid response format');
        }

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch stock price data');
        }

        return { data: result.data, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An error occurred while fetching data';
        console.error('Error loading stock price data:', e);
        return { data: null, error: errorMessage };
    }
}

export async function getLatestPrice(symbol: string): Promise<StockPrice | null> {
    try {
        const { data, error } = await db
            .from('stock_prices')
            .select('*')
            .eq('symbol', symbol)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching latest price:', e);
        return null;
    }
}

export async function getPriceRange(
    symbol: string,
    startDate: string,
    endDate: string
): Promise<StockPrice[]> {
    try {
        const { data, error } = await db
            .from('stock_prices')
            .select('*')
            .eq('symbol', symbol)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Error fetching price range:', e);
        return [];
    }
}

export async function getHistoricalPrices(
    symbol: string,
    limit: number = 252 // Default to ~1 year of trading days
): Promise<StockPrice[]> {
    try {
        const { data, error } = await db
            .from('stock_prices')
            .select('*')
            .eq('symbol', symbol)
            .order('date', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Error fetching historical prices:', e);
        return [];
    }
}
