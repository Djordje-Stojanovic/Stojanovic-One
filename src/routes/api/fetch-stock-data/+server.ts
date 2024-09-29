import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Initialize Supabase Admin Client with Service Role Key
const supabaseAdmin = createClient(
  env.VITE_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST({ request }) {
    const { identifier, identifierType, userId, notes, listName } = await request.json();

    try {
        // Check if stock_metadata already exists
        let { data: existingStockMetaData, error: selectError } = await supabaseAdmin
            .from('stock_metadata')
            .select('*')
            .eq(identifierType, identifier)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            throw selectError;
        }

        if (!existingStockMetaData) {
            // Fetch data from Finnhub
            const apiKey = env.FINNHUB_API_KEY;
            const url = `https://finnhub.io/api/v1/stock/profile2?${identifierType}=${encodeURIComponent(identifier)}&token=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log('Finnhub response:', data);

            if (!data || Object.keys(data).length === 0) {
                throw new Error('Failed to fetch stock data from Finnhub');
            }

            // Fetch logo from Parqet
            const parqetLogoUrl = `https://assets.parqet.com/logos/${identifierType}/${encodeURIComponent(identifier)}?format=png`;
            const parqetResponse = await fetch(parqetLogoUrl, { method: 'HEAD' });
            const logoUrl = parqetResponse.ok ? parqetLogoUrl : data.logo;

            // Insert into stock_metadata using the Supabase Admin Client
            const { data: newStockMetaData, error: insertError } = await supabaseAdmin
                .from('stock_metadata')
                .insert([{
                    symbol: data.ticker,
                    isin: data.isin,
                    company_name: data.name,
                    sector: data.finnhubIndustry,
                    logo_url: data.logo,
                    parqet_logo_url: logoUrl,
                    market_cap: data.marketCapitalization,
                    share_outstanding: data.shareOutstanding,
                    country: data.country,
                    currency: data.currency,
                    estimate_currency: data.estimateCurrency,
                    exchange: data.exchange,
                    ipo: data.ipo,
                    phone: data.phone,
                    weburl: data.weburl
                }])
                .select()
                .single();

            if (insertError) throw insertError;
            existingStockMetaData = newStockMetaData;
        }

        // Insert into user_stocks
        const { data: userStock, error: userStockError } = await supabaseAdmin
            .from('user_stocks')
            .insert([{
                user_id: userId,
                stock_metadata_id: existingStockMetaData.id,
                notes: notes,
                list_name: listName
            }])
            .select()
            .single();

        if (userStockError) throw userStockError;

        return json({ data: { stockMetadata: existingStockMetaData, userStock } });
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
    }
}