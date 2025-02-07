import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const OPENROUTER_API_KEY = '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';

export async function POST({ request }: RequestEvent) {
    try {
        const body = await request.json();
        
        const result = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://stojanovic.one',
                'X-Title': 'Investment Analysis Platform'
            },
            body: JSON.stringify(body)
        });

        if (!result.ok) {
            const errorText = await result.text();
            console.error('OpenRouter API error:', result.status, errorText);
            return new Response(errorText, { status: result.status });
        }

        const data = await result.json();
        return json(data);
    } catch (error) {
        console.error('Error in AI summary endpoint:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
