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
            // Fetch stock data from Financial Modeling Prep
            const fmpResponse = await fetch(
                `https://financialmodelingprep.com/api/v3/profile/${identifier}?apikey=${process.env.VITE_FMP_API_KEY}`
            );

            if (!fmpResponse.ok) {
                return json({ error: 'Failed to fetch stock data' }, { status: 500 });
            }

            const stockDataArray = await fmpResponse.json();
            
            if (!stockDataArray || !Array.isArray(stockDataArray) || stockDataArray.length === 0) {
                return json({ error: 'No stock data found' }, { status: 404 });
            }

            const stockData = stockDataArray[0];

            // Insert into stock_metadata
            const { data: newStockMetadata, error: insertError } = await supabase
                .from('stock_metadata')
                .insert([
                    {
                        symbol: stockData.symbol,
                        company_name: stockData.companyName,
                        sector: stockData.sector,
                        market_cap: stockData.mktCap,
                        exchange: stockData.exchange,
                        currency: stockData.currency,
                        country: stockData.country,
                        logo_url: stockData.image,
                        isin: stockData.isin,
                        share_outstanding: stockData.volAvg,
                        weburl: stockData.website,
                        phone: stockData.phone,
                        ipo: stockData.ipoDate,
                        price: stockData.price,
                        beta: stockData.beta,
                        vol_avg: stockData.volAvg,
                        last_div: stockData.lastDiv,
                        price_range: stockData.range,
                        changes: stockData.changes,
                        cik: stockData.cik,
                        cusip: stockData.cusip,
                        exchange_short_name: stockData.exchangeShortName,
                        industry: stockData.industry,
                        description: stockData.description,
                        ceo: stockData.ceo,
                        full_time_employees: parseInt(stockData.fullTimeEmployees),
                        address: stockData.address,
                        city: stockData.city,
                        state: stockData.state,
                        zip: stockData.zip,
                        dcf_diff: stockData.dcfDiff,
                        dcf: stockData.dcf,
                        is_etf: stockData.isEtf,
                        is_actively_trading: stockData.isActivelyTrading,
                        is_adr: stockData.isAdr,
                        is_fund: stockData.isFund
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
