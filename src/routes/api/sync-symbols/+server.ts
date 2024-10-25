import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request }) => {
    // Verify admin user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may want to implement your own admin check)
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(
            `https://financialmodelingprep.com/api/v3/financial-statement-symbol-lists?apikey=${process.env.VITE_FMP_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch symbols');
        }

        const symbols = await response.json();
        
        if (!Array.isArray(symbols)) {
            throw new Error('Invalid response format');
        }

        // Clear existing symbols and insert new ones
        const { error: deleteError } = await supabase
            .from('available_symbols')
            .delete()
            .neq('id', 0); // Delete all records

        if (deleteError) {
            throw deleteError;
        }

        // Insert new symbols in batches of 1000
        const batchSize = 1000;
        for (let i = 0; i < symbols.length; i += batchSize) {
            const batch = symbols.slice(i, i + batchSize).map(symbol => ({ symbol }));
            const { error: insertError } = await supabase
                .from('available_symbols')
                .insert(batch);

            if (insertError) {
                throw insertError;
            }
        }

        return json({ 
            success: true, 
            count: symbols.length,
            message: `Successfully synced ${symbols.length} symbols`
        });
    } catch (error) {
        console.error('Error syncing symbols:', error);
        return json({ error: 'Failed to sync symbols' }, { status: 500 });
    }
};
