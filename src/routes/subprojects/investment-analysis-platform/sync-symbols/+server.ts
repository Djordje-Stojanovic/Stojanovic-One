import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertToUSD } from '$lib/utils/currencyConverter';

const supabaseUrl = PRIVATE_SUPABASE_URL;
const supabaseServiceRoleKey = PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
const fmpApiKey = VITE_FMP_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
}

if (!fmpApiKey) {
    console.error('Missing FMP API key');
    throw new Error('Missing FMP API key');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface StockMetadata {
    id: number;
    symbol: string;
    currency: string;
    market_cap?: number;
    price?: number;
    dcf?: number;
    [key: string]: unknown;
}

async function convertMetadataToUSD(metadata: StockMetadata, exchangeRate: number): Promise<StockMetadata> {
    const fieldsToConvert = ['market_cap', 'price', 'dcf'];
    const converted = { ...metadata };
    
    for (const field of fieldsToConvert) {
        if (typeof converted[field] === 'number') {
            converted[field] = convertToUSD(converted[field] as number, exchangeRate);
        }
    }
    
    return converted;
}

export const POST: RequestHandler = async ({ request }) => {
    // Check authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Fetching symbol list from FMP...');
        const response = await fetch(
            `https://financialmodelingprep.com/api/v3/financial-statement-symbol-lists?apikey=${fmpApiKey}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch symbols: ${response.statusText}`);
        }

        const symbols = await response.json();
        
        if (!Array.isArray(symbols)) {
            throw new Error('Invalid response format');
        }

        console.log(`Fetched ${symbols.length} symbols`);

        // Upsert symbols
        console.log('Upserting symbols...');
        const batchSize = 1000;
        for (let i = 0; i < symbols.length; i += batchSize) {
            const batch = symbols.slice(i, i + batchSize).map(symbol => ({ symbol }));
            const { error: upsertError } = await supabaseAdmin
                .from('available_symbols')
                .upsert(batch, { onConflict: 'symbol' });

            if (upsertError) {
                console.error(`Error upserting batch ${i / batchSize + 1}:`, upsertError);
                throw upsertError;
            }
            console.log(`Upserted ${i + batch.length} / ${symbols.length} symbols`);
        }

        // Convert stock metadata currencies to USD
        console.log('Converting stock metadata currencies to USD...');
        const { data: stockMetadata, error: fetchError } = await supabaseAdmin
            .from('stock_metadata')
            .select('*')
            .not('currency', 'eq', 'USD');

        if (fetchError) {
            throw fetchError;
        }

        if (stockMetadata && stockMetadata.length > 0) {
            const typedMetadata = stockMetadata as StockMetadata[];
            console.log(`Found ${typedMetadata.length} stocks to convert to USD`);
            
            // Process in batches
            for (let i = 0; i < typedMetadata.length; i += batchSize) {
                const batch = typedMetadata.slice(i, i + batchSize);
                
                // Group by currency for efficient exchange rate fetching
                const byCurrency = batch.reduce<Record<string, StockMetadata[]>>((acc, stock) => {
                    if (!acc[stock.currency]) acc[stock.currency] = [];
                    acc[stock.currency].push(stock);
                    return acc;
                }, {});

                // Convert each currency group
                for (const [currency, stocks] of Object.entries(byCurrency)) {
                    try {
                        console.log(`Converting ${stocks.length} stocks from ${currency} to USD`);
                        const exchangeRate = await getExchangeRate(currency);
                        
                        for (const stock of stocks) {
                            const converted = await convertMetadataToUSD(stock, exchangeRate);
                            const { error: updateError } = await supabaseAdmin
                                .from('stock_metadata')
                                .update(converted)
                                .eq('id', stock.id);

                            if (updateError) {
                                console.error(`Error updating stock ${stock.symbol}:`, updateError);
                            }
                        }
                    } catch (error) {
                        console.error(`Error converting ${currency} to USD:`, error);
                    }
                }
                
                console.log(`Converted ${i + batch.length} / ${typedMetadata.length} stocks to USD`);
            }
        }

        console.log('Sync and currency conversion completed successfully');

        return json({ 
            success: true, 
            symbolsCount: symbols.length,
            convertedCount: stockMetadata?.length || 0,
            message: `Successfully synced ${symbols.length} symbols and converted ${stockMetadata?.length || 0} stocks to USD`
        });
    } catch (error) {
        console.error('Error in sync process:', error);
        return json({ 
            error: 'Failed to sync symbols', 
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
