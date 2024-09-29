// src/routes/api/check-isin/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }: RequestEvent) {
    const isin = url.searchParams.get('isin');
    if (!isin) {
        return json({ isValid: false, error: 'No ISIN provided' });
    }

    // Check if ISIN exists in stock_metadata
    const { data } = await supabase
        .from('stock_metadata')
        .select('id')
        .eq('isin', isin)
        .single();

    if (data) {
        return json({ isValid: true });
    }

    // Use Parqet API to validate ISIN
    try {
        const response = await fetch(`https://assets.parqet.com/logos/isin/${encodeURIComponent(isin)}?format=png`, {
            method: 'HEAD'
        });
        return json({ isValid: response.ok });
    } catch (error) {
        console.error('Error checking ISIN:', error);
        return json({ isValid: false, error: 'Failed to check ISIN' });
    }
}