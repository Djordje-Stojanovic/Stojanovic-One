import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/supabaseClient';

export const GET: RequestHandler = async ({ url }) => {
    const symbol = url.searchParams.get('symbol')?.toUpperCase();

    if (!symbol) {
        return json({ isValid: false, error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // Check if symbol exists in our VPS database
        const { data, error } = await db
            .from('available_symbols')
            .select('symbol')
            .eq('symbol', symbol)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return json({
            isValid: !!data,
            error: data ? null : 'Invalid symbol'
        });
    } catch (error) {
        console.error('Error validating symbol:', error);
        return json({ isValid: false, error: 'Failed to validate symbol' }, { status: 500 });
    }
};
