import { error, json } from '@sveltejs/kit';
import { db } from '$lib/supabaseClient';
import type { StockPrice, FMPStockPrice, FMPStockPriceResponse } from '$lib/types/stockPrices';
import type { RequestEvent } from '@sveltejs/kit';
import { getExchangeRate, convertToUSD } from '$lib/utils/currencyConverter';
import { FMP_API_KEY } from '$env/static/private';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';

async function getStockCurrency(symbol: string): Promise<string> {
    const { data, error: dbError } = await db
        .from('stock_metadata')
        .select('currency')
        .eq('symbol', symbol)
        .single();

    if (dbError) throw dbError;
    return data?.currency || 'USD';
}

async function getLatestPriceDate(symbol: string): Promise<string | null> {
    const { data, error: dbError } = await db
        .from('stock_prices')
        .select('date')
        .eq('symbol', symbol)
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (dbError || !data) return null;
    return data.date;
}

async function fetchStockPrices(symbol: string, from?: string): Promise<FMPStockPrice[]> {
    const url = new URL(`${BASE_URL}/historical-price-full/${symbol}`);
    url.searchParams.append('apikey', FMP_API_KEY);
    if (from) url.searchParams.append('from', from);

    console.log('Fetching stock prices from:', url.toString());
    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to fetch data from FMP API: ${response.statusText}`);
    }

    const data: FMPStockPriceResponse = await response.json();
    return data.historical || [];
}

async function convertFMPToDBFormat(
    symbol: string,
    price: FMPStockPrice,
    currency: string,
    exchangeRate: number
): Promise<Omit<StockPrice, 'id' | 'created_at' | 'updated_at'>> {
    // If currency is USD, no conversion needed
    if (currency === 'USD') {
        return {
            symbol,
            date: price.date,
            reported_currency: currency,
            open: price.open || null,
            high: price.high || null,
            low: price.low || null,
            close: price.close || null,
            adj_close: price.adjClose || null,
            volume: price.volume || 0,
            unadjusted_volume: price.unadjustedVolume || price.volume || 0,
            change: price.change || null,
            change_percent: price.changePercent || null,
            vwap: price.vwap || null,
            change_over_time: price.changeOverTime || null
        };
    }

    // Convert price fields to USD
    return {
        symbol,
        date: price.date,
        reported_currency: currency,
        open: price.open ? convertToUSD(price.open, exchangeRate) : null,
        high: price.high ? convertToUSD(price.high, exchangeRate) : null,
        low: price.low ? convertToUSD(price.low, exchangeRate) : null,
        close: price.close ? convertToUSD(price.close, exchangeRate) : null,
        adj_close: price.adjClose ? convertToUSD(price.adjClose, exchangeRate) : null,
        volume: price.volume || 0,
        unadjusted_volume: price.unadjustedVolume || price.volume || 0,
        change: price.change ? convertToUSD(price.change, exchangeRate) : null,
        change_percent: price.changePercent || null, // Percentage remains the same
        vwap: price.vwap ? convertToUSD(price.vwap, exchangeRate) : null,
        change_over_time: price.changeOverTime || null // This is also a percentage
    };
}

async function syncStockPrices(symbol: string, prices: FMPStockPrice[], currency: string) {
    if (!prices.length) return;

    // Get exchange rate if needed
    const exchangeRate = currency !== 'USD' ? await getExchangeRate(currency) : 1;

    // Convert all prices to DB format
    const convertedPrices = await Promise.all(
        prices.map(price => convertFMPToDBFormat(symbol, price, currency, exchangeRate))
    );

    // Upsert in batches to avoid hitting size limits
    const BATCH_SIZE = 1000;
    for (let i = 0; i < convertedPrices.length; i += BATCH_SIZE) {
        const batch = convertedPrices.slice(i, i + BATCH_SIZE);

        const { error: upsertError } = await db
            .from('stock_prices')
            .upsert(batch, {
                onConflict: 'symbol,date',
                ignoreDuplicates: false // Set to false to update existing records
            });

        if (upsertError) {
            throw new Error(`Failed to upsert price batch: ${upsertError.message}`);
        }
    }
}

export async function GET({ params }: RequestEvent) {
    try {
        const { symbol } = params;
        if (!symbol) {
            throw error(400, 'Symbol is required');
        }

        // Get the latest date from our database
        const latestDate = await getLatestPriceDate(symbol);
        
        // If we have data, use that date as the from parameter
        // If no data, start from 1980
        let fromDate: string;
        if (latestDate) {
            fromDate = latestDate; // Use the exact latest date to ensure we update that day's data too
        } else {
            fromDate = '1980-01-01'; // If no data exists, start from 1980
        }

        // Get the stock's currency
        const currency = await getStockCurrency(symbol);

        // Fetch from FMP API with the from date
        const fmpPrices = await fetchStockPrices(symbol, fromDate);
        
        // Sync with database using upsert
        await syncStockPrices(symbol, fmpPrices, currency);

        // Fetch all data for the symbol
        const { data: dbPrices, error: dbError } = await db
            .from('stock_prices')
            .select('*')
            .eq('symbol', symbol)
            .order('date', { ascending: false });

        if (dbError) {
            throw new Error(`Failed to fetch synced data: ${dbError.message}`);
        }

        return json({
            success: true,
            data: {
                symbol,
                historical: dbPrices || []
            }
        });
    } catch (e) {
        console.error('Error in stock prices API:', e);
        throw error(500, e instanceof Error ? e.message : 'Internal server error');
    }
}
