import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/supabaseClient';
import type { ListName } from '$lib/constants/listNames';

interface MoveRequest {
    stockId: string;
    newList: ListName;
}

export async function POST({ request, locals }: RequestEvent) {
    try {
        // Check authentication
        if (!locals.session?.user) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // Parse request body
        let body: MoveRequest;
        try {
            body = await request.json();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Invalid JSON in request body';
            console.error('JSON parse error:', message);
            return new Response(
                JSON.stringify({ success: false, error: message }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const { stockId, newList } = body;

        // Validate required fields
        if (!stockId || !newList) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required fields' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // Update the stock's list
        const { data, error } = await db
            .from('user_stocks')
            .update({ 
                list_name: newList,
                updated_at: new Date().toISOString()
            })
            .eq('id', stockId)
            .eq('user_id', locals.session.user.id)
            .select(`
                *,
                stock_metadata (*)
            `)
            .single();

        if (error) {
            console.error('Database error:', error);
            return new Response(
                JSON.stringify({ success: false, error: 'Database error' }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        if (!data) {
            return new Response(
                JSON.stringify({ success: false, error: 'Stock not found' }),
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('Server error:', err);
        return new Response(
            JSON.stringify({ success: false, error: message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
