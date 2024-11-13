import { supabase } from '$lib/supabaseClient';
import type { ListName } from '$lib/constants/listNames';
import type { FinancialData } from '$lib/types/financialStatements';

export async function findCompanyList(symbol: string): Promise<ListName | null> {
    try {
        const { data, error: queryError } = await supabase
            .from('user_stocks')
            .select(`
                list_name,
                stock_metadata!inner (
                    symbol
                )
            `)
            .eq('stock_metadata.symbol', symbol.toUpperCase())
            .single();

        if (queryError) throw queryError;
        
        return data?.list_name as ListName || null;
    } catch (e) {
        console.error('Error finding company list:', e);
        return null;
    }
}

export async function fetchCompanyName(symbol: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('stock_metadata')
            .select('company_name')
            .eq('symbol', symbol)
            .single();

        if (error) {
            throw error;
        }
        return data?.company_name ?? null;
    } catch (e) {
        console.error('Error fetching company name:', e);
        return null;
    }
}

export async function loadFinancialData(
    symbol: string, 
    sessionToken: string,
    forceRefresh = false
): Promise<{ data: FinancialData | null; error: string | null }> {
    try {
        const url = new URL(`/api/financial-data/${symbol}`, window.location.origin);
        if (forceRefresh) {
            url.searchParams.set('forceRefresh', 'true');
        }

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error('Invalid response format');
        }

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch financial data');
        }

        return { data: result.data, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An error occurred while fetching data';
        console.error('Error loading financial data:', e);
        return { data: null, error: errorMessage };
    }
}
