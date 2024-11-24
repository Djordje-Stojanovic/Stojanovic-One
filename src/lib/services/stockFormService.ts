import { db } from '$lib/supabaseClient';
import type { ListName } from '$lib/constants/listNames';

export async function searchSymbols(query: string): Promise<string[]> {
    if (!query) return [];

    try {
        // First, try to find exact matches
        const { data: exactMatches, error: exactError } = await db
            .from('available_symbols')
            .select('symbol')
            .ilike('symbol', query)
            .limit(5);

        if (exactError) throw exactError;

        // Then, find symbols that start with the query
        const { data: startsWithMatches, error: startsWithError } = await db
            .from('available_symbols')
            .select('symbol')
            .ilike('symbol', `${query}%`)
            .not('symbol', 'ilike', query)
            .limit(5);

        if (startsWithError) throw startsWithError;

        // Finally, find symbols that contain the query anywhere
        const { data: containsMatches, error: containsError } = await db
            .from('available_symbols')
            .select('symbol')
            .ilike('symbol', `%${query}%`)
            .not('symbol', 'ilike', `${query}%`)
            .limit(5);

        if (containsError) throw containsError;

        // Combine results in priority order
        return [
            ...(exactMatches || []).map(item => item.symbol),
            ...(startsWithMatches || []).map(item => item.symbol),
            ...(containsMatches || []).map(item => item.symbol)
        ].slice(0, 5);
    } catch (error) {
        console.error('Error searching symbols:', error);
        return [];
    }
}

export async function validateSymbol(symbol: string, accessToken: string): Promise<{ isValid: boolean; error?: string }> {
    try {
        const response = await fetch(`/api/check-symbol?symbol=${symbol}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to validate symbol');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error validating symbol:', error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Failed to validate symbol'
        };
    }
}

export async function addStock(data: {
    identifier: string;
    notes: string;
    listName: ListName;
    accessToken: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const response = await fetch('/api/fetch-stock-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.accessToken}`
            },
            body: JSON.stringify({
                identifier: data.identifier,
                identifierType: 'symbol',
                notes: data.notes,
                listName: data.listName
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add stock');
        }

        const result = await response.json();
        return { success: true, id: result.data.id };
    } catch (error) {
        console.error('Error adding stock:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add stock'
        };
    }
}
