import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }: RequestEvent) {
    const isin = url.searchParams.get('isin')?.toUpperCase();
    if (!isin) {
        return json({ isValid: false, error: 'No ISIN provided' });
    }

    try {
        // ISIN format validation
        if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)) {
            return json({ isValid: false, error: 'Invalid ISIN format' });
        }

        // Check if ISIN exists in our database
        const { data } = await supabase
            .from('stock_metadata')
            .select('id')
            .eq('isin', isin)
            .maybeSingle();

        return json({ isValid: !!data });
    } catch (error) {
        console.error('Error checking ISIN:', error);
        return json({ isValid: false, error: 'Failed to validate ISIN' });
    }
}
