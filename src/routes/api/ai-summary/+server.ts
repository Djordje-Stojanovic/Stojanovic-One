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
