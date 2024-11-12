import { writable, get } from 'svelte/store';
import { supabase } from '../supabaseClient';
import { session } from './sessionStore';
import type { UserStock } from '../types';
import type { ListName } from '../constants/listNames';

type InvestmentState = {
    stocks: UserStock[];
    loading: boolean;
    error: string | null;
    isSyncing: boolean;
    syncError: string | null;
    syncResult: string | null;
    hoveredList: ListName | null;
    dragSourceList: ListName | null;
};

type InvestmentStore = {
    subscribe: (run: (value: InvestmentState) => void) => () => void;
    fetchStocks: () => Promise<void>;
    setHoveredList: (listName: ListName | null) => void;
    setDragSourceList: (listName: ListName | null) => void;
    syncSymbols: () => Promise<void>;
    deleteStock: (stockId: string) => Promise<void>;
    moveStock: (stockId: string, newListName: ListName) => Promise<void>;
};

function createInvestmentStore(): InvestmentStore {
    const { subscribe, update } = writable<InvestmentState>({
        stocks: [],
        loading: false,
        error: null,
        isSyncing: false,
        syncError: null,
        syncResult: null,
        hoveredList: null,
        dragSourceList: null
    });

    const store: InvestmentStore = {
        subscribe,

        fetchStocks: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const currentSession = get(session);
                const userId = currentSession?.user?.id;
                
                if (!userId) {
                    throw new Error('No user ID available');
                }

                const { data, error: fetchError } = await supabase
                    .from('user_stocks')
                    .select(`*, metadata:stock_metadata (*)`)
                    .eq('user_id', userId);

                if (fetchError) throw fetchError;
                update(state => ({ ...state, stocks: data || [], loading: false }));
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'Failed to fetch stocks';
                update(state => ({ ...state, error: errorMessage, loading: false }));
            }
        },

        setHoveredList: (listName: ListName | null) => {
            update(state => ({ ...state, hoveredList: listName }));
        },

        setDragSourceList: (listName: ListName | null) => {
            update(state => ({ ...state, dragSourceList: listName }));
        },

        syncSymbols: async () => {
            update(state => ({ ...state, isSyncing: true, syncError: null, syncResult: null }));
            try {
                const currentSession = get(session);
                if (!currentSession) {
                    throw new Error('User not authenticated');
                }

                const response = await fetch('/subprojects/investment-analysis-platform/sync-symbols', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentSession.access_token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to sync symbols');
                }
                
                update(state => ({ ...state, syncResult: `Successfully synced ${data.count} symbols` }));
                await store.fetchStocks();
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
                update(state => ({ ...state, syncError: errorMessage }));
            } finally {
                update(state => ({ ...state, isSyncing: false }));
            }
        },

        deleteStock: async (stockId: string) => {
            try {
                const { error: deleteError } = await supabase
                    .from('user_stocks')
                    .delete()
                    .eq('id', stockId);

                if (deleteError) throw deleteError;

                update(state => ({
                    ...state,
                    stocks: state.stocks.filter(stock => stock.id !== stockId)
                }));
            } catch (error) {
                console.error('Error deleting stock:', error);
                throw error;
            }
        },

        moveStock: async (stockId: string, newListName: ListName) => {
            try {
                const { data, error: moveError } = await supabase
                    .from('user_stocks')
                    .update({ list_name: newListName })
                    .eq('id', stockId)
                    .select()
                    .single();

                if (moveError) throw moveError;

                // Update local state immediately
                update(state => ({
                    ...state,
                    stocks: state.stocks.map(stock => 
                        stock.id === stockId 
                            ? { ...stock, list_name: newListName }
                            : stock
                    )
                }));

                return data;
            } catch (error) {
                console.error('Error moving stock:', error);
                throw error;
            }
        }
    };

    return store;
}

export const investmentStore = createInvestmentStore();
