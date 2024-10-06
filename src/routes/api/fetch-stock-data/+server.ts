import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import {
  VITE_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  FINNHUB_API_KEY
} from '$env/static/private';

if (!VITE_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !FINNHUB_API_KEY) {
  throw new Error('Missing required environment variables');
}

// Initialize Supabase client with the service role key
const supabase = createClient(VITE_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // Insert or update stock metadata in Supabase
    const { data: stockMetadata, error: metadataError } = await supabase
      .from('stock_metadata')
      .upsert({
        symbol: stockData.ticker,
        company_name: stockData.name,
        sector: stockData.finnhubIndustry,
        market_cap: stockData.marketCapitalization,
        exchange: stockData.exchange,
        logo_url: stockData.logo,
        country: stockData.country,
        currency: stockData.currency,
        estimate_currency: stockData.estimateCurrency,
        ipo: stockData.ipo,
        phone: stockData.phone,
        weburl: stockData.weburl,
        share_outstanding: stockData.shareOutstanding,
      }, { onConflict: 'symbol' })
      .select()
      .single();

    if (metadataError) {
      console.error('Error upserting stock metadata:', metadataError);
      return json({ error: 'Failed to upsert stock metadata' }, { status: 500 });
    }

    // Check if the user already has this stock in their list
    const { data: existingUserStock, error: existingStockError } = await supabase
      .from('user_stocks')
      .select()
      .eq('user_id', userId)
      .eq('stock_metadata_id', stockMetadata.id)
      .eq('list_name', listName)
      .single();

    if (existingStockError && existingStockError.code !== 'PGRST116') {
      console.error('Error checking existing user stock:', existingStockError);
      return json({ error: 'Failed to check existing user stock' }, { status: 500 });
    }

    let userStock;

    if (existingUserStock) {
      // Update existing user stock
      const { data: updatedStock, error: updateError } = await supabase
        .from('user_stocks')
        .update({ notes })
        .eq('id', existingUserStock.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user stock:', updateError);
        return json({ error: 'Failed to update user stock' }, { status: 500 });
      }

      userStock = updatedStock;
    } else {
      // Insert new user stock
      const { data: newStock, error: insertError } = await supabase
        .from('user_stocks')
        .insert({
          user_id: userId,
          stock_metadata_id: stockMetadata.id,
          notes,
          list_name: listName,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting user stock:', insertError);
        return json({ error: 'Failed to insert user stock' }, { status: 500 });
      }

      userStock = newStock;
    }

    return json({ success: true, data: userStock });
  } catch (error: unknown) {
    console.error('Error in fetch-stock-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ error: errorMessage }, { status: 500 });
  }
}