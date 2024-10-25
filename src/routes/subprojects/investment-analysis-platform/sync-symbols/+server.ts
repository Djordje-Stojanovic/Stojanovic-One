import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE_KEY, VITE_FMP_API_KEY } from '$env/static/private';

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

        console.log('Sync completed successfully');

        return json({ 
            success: true, 
            count: symbols.length,
            message: `Successfully synced ${symbols.length} symbols`
        });
    } catch (error) {
        console.error('Error in sync process:', error);
        return json({ 
            error: 'Failed to sync symbols', 
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
