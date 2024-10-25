import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { identifier, identifierType, notes, listName } = await request.json();

        // Get the user from the session
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return json({ error: 'No authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First check if stock already exists in stock_metadata
        const { data: existingStock, error: existingStockError } = await supabase
            .from('stock_metadata')
            .select('*')
            .eq(identifierType === 'symbol' ? 'symbol' : 'isin', identifier)
            .single();

        if (existingStockError && existingStockError.code !== 'PGRST116') {
            return json({ error: existingStockError.message }, { status: 500 });
        }

        let stockMetadataId;

        if (existingStock) {
            // Use existing stock metadata
            stockMetadataId = existingStock.id;
        } else {
            // Fetch stock data from Finnhub
            const finnhubResponse = await fetch(
                `https://finnhub.io/api/v1/stock/profile2?${identifierType}=${identifier}&token=${process.env.FINNHUB_API_KEY}`
            );

            if (!finnhubResponse.ok) {
                return json({ error: 'Failed to fetch stock data' }, { status: 500 });
            }

            const stockData = await finnhubResponse.json();

            if (!stockData || Object.keys(stockData).length === 0) {
                return json({ error: 'No stock data found' }, { status: 404 });
            }

            // Insert into stock_metadata
            const { data: newStockMetadata, error: insertError } = await supabase
                .from('stock_metadata')
                .insert([
                    {
                        symbol: stockData.ticker,
                        company_name: stockData.name,
                        sector: stockData.finnhubIndustry,
                        market_cap: stockData.marketCapitalization,
                        exchange: stockData.exchange,
                        currency: stockData.currency,
                        country: stockData.country,
                        logo_url: stockData.logo,
                        isin: stockData.isin,
                        share_outstanding: stockData.shareOutstanding,
                        weburl: stockData.weburl,
                        phone: stockData.phone,
                        ipo: stockData.ipo
                    }
                ])
                .select()
                .single();

            if (insertError) {
                return json({ error: insertError.message }, { status: 500 });
            }

            stockMetadataId = newStockMetadata.id;
        }

        // Create user_stocks entry
        const { data: userStock, error: userStockError } = await supabase
            .from('user_stocks')
            .insert([
                {
                    user_id: user.id,
                    stock_metadata_id: stockMetadataId,
                    notes,
                    list_name: listName
                }
            ])
            .select(`
                *,
                stock_metadata (*)
            `)
            .single();

        if (userStockError) {
            return json({ error: userStockError.message }, { status: 500 });
        }

        return json({ data: userStock });
    } catch (error) {
        console.error('Error in fetch-stock-data:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
