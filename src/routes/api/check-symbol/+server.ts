import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }: RequestEvent) {
    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
        return json({ isValid: false, error: 'No symbol provided' });
    }

    // Check if symbol exists in stock_metadata
    const { data } = await supabase
        .from('stock_metadata')
        .select('id')
        .eq('symbol', symbol)
        .single();

    if (data) {
        return json({ isValid: true });
    }

    // Use Parqet API to validate symbol
    try {
        const response = await fetch(`https://assets.parqet.com/logos/symbol/${encodeURIComponent(symbol)}?format=png`, {
            method: 'HEAD'
        });
        return json({ isValid: response.ok });
    } catch (error) {
        console.error('Error checking symbol:', error);
        return json({ isValid: false, error: 'Failed to check symbol' });
    }
}