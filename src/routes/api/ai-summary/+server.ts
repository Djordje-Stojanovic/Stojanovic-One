import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OPENROUTER_API_KEY } from '$env/static/private';

export async function POST({ request, getClientAddress }: RequestEvent) {
    try {
        const clientIp = getClientAddress();
        const cfIp = request.headers.get('cf-connecting-ip') || clientIp;
        const realIp = request.headers.get('x-real-ip');
        const forwardedFor = request.headers.get('x-forwarded-for');
        
        console.log('IP Debug:', {
            clientIp,
            cfIp,
            realIp,
            forwardedFor,
            relevantHeaders: {
                'user-agent': request.headers.get('user-agent'),
                'origin': request.headers.get('origin'),
                'referer': request.headers.get('referer'),
                'host': request.headers.get('host'),
                'cf-ipcountry': request.headers.get('cf-ipcountry'),
                'cf-ray': request.headers.get('cf-ray')
            }
        });
        
        const body = await request.json();
        
        const result = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://stojanovic-one.com',
                'X-Title': 'Investment Analysis Platform',
                'X-Forwarded-For': '159.69.6.133',  // VPS IP
                'Origin': 'https://stojanovic-one.com',
                'User-Agent': 'Stojanovic-One/1.0'
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
