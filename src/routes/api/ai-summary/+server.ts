import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OPENROUTER_API_KEY, GEMINI_API_KEY } from '$env/static/private';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function POST({ request }: RequestEvent) {
    try {
        const { api, ...body } = await request.json();
        
        if (api === 'openrouter') {
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
        } else if (api === 'gemini') {
            const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: body.messages.map((msg: ChatMessage) => 
                            `${msg.role === 'system' ? 'Instructions: ' : ''}${msg.content}`
                        ).join('\n\n') }]
                    }],
                    generationConfig: {
                        temperature: body.temperature,
                        topP: body.top_p,
                        maxOutputTokens: body.max_tokens
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                })
            });

            if (!result.ok) {
                const errorText = await result.text();
                console.error('Gemini API error:', result.status, errorText);
                return new Response(errorText, { status: result.status });
            }

            const data = await result.json();
            // Transform Gemini response to match OpenRouter format
            return json({
                choices: [{
                    message: {
                        content: data.candidates[0].content.parts[0].text,
                        role: 'assistant'
                    }
                }]
            });
        }

        throw new Error('Invalid API specified');
    } catch (error) {
        console.error('Error in AI summary endpoint:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
