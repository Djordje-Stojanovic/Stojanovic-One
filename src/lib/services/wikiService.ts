import { supabase } from '$lib/supabaseClient';
import type { WikiContent } from '../types/wiki';

export async function loadWikiContent(symbol: string, section: string): Promise<WikiContent | null> {
    const { data, error } = await supabase
        .from('company_wiki')
        .select('id, content, updated_at, user_id')
        .eq('symbol', symbol)
        .eq('section', section)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Add symbol and section to the returned data
    return {
        ...data,
        symbol,
        section
    } as WikiContent;
}

export async function saveWikiContent(symbol: string, section: string, content: string, userId: string | undefined) {
    if (!userId) throw new Error('User must be logged in to save content');

    // First, save current version to history
    const currentData = await loadWikiContent(symbol, section);
    
    if (currentData) {
        // Save to history with current timestamp
        await saveToHistory(symbol, section, currentData);
        
        // Clean up old history entries
        await cleanupHistory(symbol, section);
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Update current content with new timestamp
    const { error } = await supabase
        .from('company_wiki')
        .upsert(
            {
                symbol,
                section,
                content,
                user_id: userId,
                updated_at: now // Explicitly set the timestamp
            },
            { onConflict: 'symbol,section' }
        );

    if (error) throw error;
}

async function saveToHistory(symbol: string, section: string, currentData: WikiContent) {
    // Get current timestamp for history entry
    const now = new Date().toISOString();

    const { error } = await supabase
        .from('company_wiki_history')
        .insert({
            wiki_id: currentData.id,
            symbol,
            section,
            content: currentData.content,
            user_id: currentData.user_id,
            updated_at: now // Use current timestamp instead of currentData.updated_at
        });

    if (error) throw error;
}

async function cleanupHistory(symbol: string, section: string) {
    const { data: historyEntries } = await supabase
        .from('company_wiki_history')
        .select('id')
        .eq('symbol', symbol)
        .eq('section', section)
        .order('updated_at', { ascending: true });

    if (historyEntries && historyEntries.length > 5) {
        await supabase
            .from('company_wiki_history')
            .delete()
            .eq('id', historyEntries[0].id);
    }
}

export async function loadUserData(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function revertContent(symbol: string, section: string, content: string, userId: string | undefined) {
    if (!userId) throw new Error('User must be logged in to revert content');

    const now = new Date().toISOString();

    const { error } = await supabase
        .from('company_wiki')
        .update({
            content,
            user_id: userId,
            updated_at: now // Add explicit timestamp for reverts too
        })
        .eq('symbol', symbol)
        .eq('section', section);

    if (error) throw error;
}
