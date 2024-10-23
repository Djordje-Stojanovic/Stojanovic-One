import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import type { ListName } from '$lib/constants/listNames';

interface RequestBody {
    identifier: string;
    identifierType: 'symbol' | 'isin';
    notes: string;
    listName: ListName;
}

export async function POST({ request, locals }: RequestEvent) {
    if (!locals.session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { identifier, identifierType, notes, listName } = await request.json() as RequestBody;

    if (!identifier || !identifierType || !listName) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Fetch stock data from Finnhub API
        const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?${identifierType}=${identifier}&token=${process.env.FINNHUB_API_KEY}`);
        if (!response.ok) {
            console.error('Failed to fetch stock data from Finnhub:', response.statusText);
            throw new Error('Failed to fetch stock data from Finnhub');
        }
        const stockData = await response.json();

        // Upsert stock metadata with data from Finnhub
        const { data: metadata, error: metadataError } = await supabase
            .from('stock_metadata')
            .upsert([{
                [identifierType]: identifier,
                company_name: stockData.name,
                sector: stockData.finnhubIndustry,
                logo_url: stockData.logo,
                market_cap: stockData.marketCapitalization,
                exchange: stockData.exchange,
                country: stockData.country,
                currency: stockData.currency,
                ipo: stockData.ipo,
                phone: stockData.phone,
                weburl: stockData.weburl
            }], {
                onConflict: identifierType,
                ignoreDuplicates: true
            })
            .select()
            .single();

        if (metadataError) {
            console.error('Error upserting stock metadata:', metadataError);
            throw metadataError;
        }

        // Create user stock entry
        const { data: userStock, error: stockError } = await supabase
            .from('user_stocks')
            .insert([{
                user_id: locals.session.user.id,
                stock_metadata_id: metadata.id,
                notes,
                list_name: listName
            }])
            .select('*, stock_metadata(*)')
            .single();

        if (stockError) {
            console.error('Error inserting user stock:', stockError);
            throw stockError;
        }

        return json({ data: userStock });
    } catch (error) {
        console.error('Error adding stock:', error);
        return json({ error: 'Failed to add stock' }, { status: 500 });
    }
}
