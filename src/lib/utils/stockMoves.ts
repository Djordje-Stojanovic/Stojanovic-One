import type { ListName } from '$lib/constants/listNames';
import type { UserStock } from '$lib/types';
import { supabase, db } from '$lib/supabaseClient';

export const allowedMoves: Record<ListName, ListName[]> = {
    'Watchlist': ['Due Diligence', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Due Diligence': ['Buy Ready', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Buy Ready': ['Core Holdings', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Core Holdings': ['Regular Review', 'Sell Ready', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Regular Review': ['Sell Ready', 'Core Holdings', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Sell Ready': ['Sold', 'Regular Review', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Sold': ['Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Too Expensive': ['Pass For Now', 'Permanent Pass'],
    'Pass For Now': ['Due Diligence', 'Permanent Pass'],
    'Permanent Pass': [] // No transitions out
};

export async function moveStock(stockId: string, newList: ListName): Promise<{ data: UserStock | null; error: Error | null }> {
    try {
        // Get current session from hosted Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            throw new Error('Not authenticated');
        }

        console.log('Moving stock:', { stockId, newList });
        
        // Update the stock's list using VPS database
        const { data, error } = await db
            .from('user_stocks')
            .update({ 
                list_name: newList,
                updated_at: new Date().toISOString()
            })
            .eq('id', stockId)
            .eq('user_id', session.user.id)
            .select(`
                *,
                stock_metadata (*)
            `)
            .single();

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        if (!data) {
            console.error('No data returned from update');
            throw new Error('Stock not found');
        }

        console.log('Raw data from server:', data);

        // Transform the data to match UserStock type
        const userStock: UserStock = {
            id: data.id,
            user_id: data.user_id,
            stock_metadata_id: data.stock_metadata_id,
            list_name: data.list_name as ListName,
            created_at: data.created_at,
            updated_at: data.updated_at,
            notes: data.notes || undefined,
            metadata: {
                id: data.stock_metadata.id,
                symbol: data.stock_metadata.symbol,
                company_name: data.stock_metadata.company_name,
                sector: data.stock_metadata.sector,
                market_cap: Number(data.stock_metadata.market_cap),
                exchange: data.stock_metadata.exchange,
                currency: data.stock_metadata.currency,
                country: data.stock_metadata.country,
                logo_url: data.stock_metadata.logo_url,
                parqet_logo_url: data.stock_metadata.parqet_logo_url,
                isin: data.stock_metadata.isin,
                share_outstanding: data.stock_metadata.share_outstanding,
                estimate_currency: data.stock_metadata.estimate_currency,
                ipo: data.stock_metadata.ipo,
                phone: data.stock_metadata.phone,
                weburl: data.stock_metadata.weburl
            }
        };

        console.log('Transformed userStock:', userStock);

        return { data: userStock, error: null };
    } catch (error) {
        console.error('Error moving stock:', error);
        return { 
            data: null, 
            error: error instanceof Error ? error : new Error('Unknown error') 
        };
    }
}
