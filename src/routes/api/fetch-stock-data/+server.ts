import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY, FINNHUB_API_KEY } from '$env/static/private';

if (!VITE_PUBLIC_SUPABASE_URL || !VITE_PUBLIC_SUPABASE_ANON_KEY || !FINNHUB_API_KEY) {
  throw new Error('Missing required environment variables');
}

// Initialize Supabase client
const supabase = createClient(VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY);

export async function POST({ request }) {
  try {
    const { identifier, identifierType, userId, notes, listName } = await request.json();

    // Validate input data
    if (!identifier || !identifierType || !userId || !listName) {
      return json({ error: 'Missing required data' }, { status: 400 });
    }
    // Use the Finnhub API key to fetch stock data
    const apiUrl = `https://finnhub.io/api/v1/stock/profile2?${identifierType}=${identifier}&token=${FINNHUB_API_KEY}`;

    const response = await fetch(apiUrl);
    const stockData = await response.json();

    if (stockData.error) {
      console.error('Finnhub API Error:', stockData.error);
      return json({ error: 'Failed to fetch stock data from Finnhub' }, { status: 500 });
    }

    // Ensure required fields are present
    if (!stockData.ticker) {
      console.error('Invalid stock data received from Finnhub:', stockData);
      return json({ error: 'Invalid stock data received from Finnhub' }, { status: 500 });
    }

    // Insert stock metadata into Supabase
    const { data: stockMetadata, error: metadataError } = await supabase
      .from('stock_metadata')
      .upsert({
        symbol: stockData.ticker,
        company_name: stockData.name,
        sector: stockData.finnhubIndustry,
        market_cap: stockData.marketCapitalization,
        exchange: stockData.exchange,
        logo_url: stockData.logo,
      })
      .select()
      .single();

    if (metadataError) {
      console.error('Error inserting stock metadata:', metadataError);
      return json({ error: 'Failed to insert stock metadata' }, { status: 500 });
    }

    // Insert into user_stocks table
    const { data: userStock, error: userStockError } = await supabase
      .from('user_stocks')
      .insert({
        user_id: userId,
        stock_metadata_id: stockMetadata.id,
        notes,
        list_name: listName,
      })
      .select()
      .single();

    if (userStockError) {
      console.error('Error inserting user stock:', userStockError);
      return json({ error: 'Failed to insert user stock' }, { status: 500 });
    }

    return json({ success: true, data: userStock });
  } catch (error: unknown) {
    console.error('Error in fetch-stock-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ error: errorMessage }, { status: 500 });
  }
}