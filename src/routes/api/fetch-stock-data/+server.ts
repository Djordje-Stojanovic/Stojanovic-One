import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';
import { FMP_API_KEY } from '$env/static/private';
import { getExchangeRate, convertToUSD } from '$lib/utils/currencyConverter';

interface FMPStockData {
    symbol: string;
    companyName: string;
    currency: string;
    mktCap: number;
    price: number;
    dcf: number;
    sector: string;
    exchange: string;
    country: string;
    image: string;
    isin: string;
    volAvg: number;
    website: string;
    phone: string;
    ipoDate: string;
    beta: number;
    lastDiv: number;
    range: string;
    changes: number;
    cik: string | null;
    cusip: string | null;
    exchangeShortName: string;
    industry: string;
    description: string;
    ceo: string;
    fullTimeEmployees: string;
    address: string;
    city: string;
    state: string | null;
    zip: string;
    dcfDiff: number;
    isEtf: boolean;
    isActivelyTrading: boolean;
    isAdr: boolean;
    isFund: boolean;
}

async function convertMetadataToUSD(stockData: FMPStockData): Promise<Record<string, unknown>> {
    if (stockData.currency === 'USD') {
        return {
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
        };
    }

    console.log(`Converting ${stockData.symbol} from ${stockData.currency} to USD...`);
    const exchangeRate = await getExchangeRate(stockData.currency);
    console.log(`Exchange rate for ${stockData.currency}/USD: ${exchangeRate}`);

    // Convert numeric values
    const marketCapUSD = convertToUSD(stockData.mktCap, exchangeRate);
    const priceUSD = convertToUSD(stockData.price, exchangeRate);
    const dcfUSD = convertToUSD(stockData.dcf, exchangeRate);
    const lastDivUSD = convertToUSD(stockData.lastDiv, exchangeRate);

    console.log(`Converted values for ${stockData.symbol}:
        Market Cap: ${stockData.mktCap} ${stockData.currency} -> ${marketCapUSD} USD
        Price: ${stockData.price} ${stockData.currency} -> ${priceUSD} USD
        DCF: ${stockData.dcf} ${stockData.currency} -> ${dcfUSD} USD
        Last Div: ${stockData.lastDiv} ${stockData.currency} -> ${lastDivUSD} USD
    `);

    return {
        symbol: stockData.symbol,
        company_name: stockData.companyName,
        sector: stockData.sector,
        market_cap: marketCapUSD,
        exchange: stockData.exchange,
        currency: stockData.currency,
        country: stockData.country,
        logo_url: stockData.image,
        isin: stockData.isin,
        share_outstanding: stockData.volAvg,
        weburl: stockData.website,
        phone: stockData.phone,
        ipo: stockData.ipoDate,
        price: priceUSD,
        beta: stockData.beta,
        vol_avg: stockData.volAvg,
        last_div: lastDivUSD,
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
        dcf: dcfUSD,
        is_etf: stockData.isEtf,
        is_actively_trading: stockData.isActivelyTrading,
        is_adr: stockData.isAdr,
        is_fund: stockData.isFund
    };
}

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
                `https://financialmodelingprep.com/api/v3/profile/${identifier}?apikey=${FMP_API_KEY}`
            );

            if (!fmpResponse.ok) {
                return json({ error: 'Failed to fetch stock data' }, { status: 500 });
            }

            const stockDataArray = await fmpResponse.json();
            
            if (!stockDataArray || !Array.isArray(stockDataArray) || stockDataArray.length === 0) {
                return json({ error: 'No stock data found' }, { status: 404 });
            }

            // Convert the data to USD before inserting
            const convertedData = await convertMetadataToUSD(stockDataArray[0] as FMPStockData);

            // Insert into stock_metadata
            const { data: newStockMetadata, error: insertError } = await supabase
                .from('stock_metadata')
                .insert([convertedData])
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
