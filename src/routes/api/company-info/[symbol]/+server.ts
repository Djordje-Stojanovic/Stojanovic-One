import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/supabaseClient';

export async function GET({ params, request }: RequestEvent) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        throw error(401, 'No authorization header');
    }

    const symbol = params.symbol;
    if (!symbol) {
        throw error(400, 'Symbol is required');
    }

    try {
        // Query the company info from your database
        const { data, error: queryError } = await db
            .from('stock_metadata')
            .select(`
                symbol,
                company_name,
                ceo,
                sector,
                industry,
                price,
                market_cap,
                beta,
                exchange,
                currency,
                last_div,
                price_range,
                full_time_employees,
                ipo,
                city,
                state,
                country,
                description,
                weburl
            `)
            .eq('symbol', symbol.toUpperCase())
            .single();

        if (queryError) {
            console.error('Database query error:', queryError);
            throw error(500, 'Failed to fetch company info');
        }

        // Transform snake_case to camelCase and format data
        const companyInfo = data ? {
            symbol: data.symbol,
            companyName: data.company_name,
            ceo: data.ceo,
            sector: data.sector,
            industry: data.industry,
            price: data.price,
            marketCap: data.market_cap,
            beta: data.beta,
            exchange: data.exchange,
            currency: data.currency,
            lastDividend: data.last_div,
            priceRange: data.price_range,
            employees: data.full_time_employees,
            ipoDate: data.ipo,
            location: [data.city, data.state, data.country].filter(Boolean).join(', '),
            description: data.description,
            website: data.weburl
        } : null;

        return json(companyInfo);
    } catch (err) {
        console.error('Error fetching company info:', err);
        throw error(500, 'Internal server error');
    }
}
