import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ url }: RequestEvent) {
    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
        return json({ isValid: false, error: 'No symbol provided' });
    }

    try {
        const response = await fetch(`https://assets.parqet.com/logos/symbol/${symbol}?format=png`, {
            method: 'HEAD'
        });
        return json({ isValid: response.ok, status: response.status });
    } catch (error) {
        console.error('Error checking symbol:', error);
        return json({ isValid: false, error: 'Failed to check symbol' });
    }
}
