// src/routes/api/check-isin/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ url }: RequestEvent) {
    const isin = url.searchParams.get('isin');
    if (!isin) {
        return json({ isValid: false, error: 'No ISIN provided' });
    }

    try {
        const response = await fetch(`https://assets.parqet.com/logos/isin/${isin}?format=png`, {
            method: 'HEAD'
        });
        return json({ isValid: response.ok, status: response.status });
    } catch (error) {
        console.error('Error checking ISIN:', error);
        return json({ isValid: false, error: 'Failed to check ISIN' });
    }
}