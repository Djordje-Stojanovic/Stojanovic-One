import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }: RequestEvent) {
    const symbol = url.searchParams.get('symbol')?.toUpperCase();
    if (!symbol) {
        return json({ isValid: false, error: 'No symbol provided' });
    }

    try {
        // Simple format validation first
        if (!/^[A-Z0-9.]{1,5}$/.test(symbol)) {
            return json({ isValid: false, error: 'Invalid symbol format' });
        }

        // Check if symbol exists in our database
        const { data } = await supabase
            .from('stock_metadata')
            .select('id')
            .eq('symbol', symbol)
            .maybeSingle();

        // If we have it in our database, it's valid
        if (data) {
            return json({ isValid: true });
        }

        // Validate against external API
        const response = await fetch(`https://assets.parqet.com/logos/symbol/${symbol}?format=png`, {
            method: 'HEAD'
        });

        return json({ isValid: response.ok });
    } catch (error) {
        console.error('Error checking symbol:', error);
        return json({ isValid: false, error: 'Failed to validate symbol' });
    }
}
