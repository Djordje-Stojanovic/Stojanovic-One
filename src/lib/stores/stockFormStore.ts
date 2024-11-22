import { writable, derived, get } from 'svelte/store';
import type { ListName } from '$lib/constants/listNames';
import { searchSymbols, validateSymbol, addStock } from '$lib/services/stockFormService';
import { session } from './sessionStore';

type FormState = {
    identifier: string;
    notes: string;
    isValid: boolean;
    errorMessage: string;
    isLoading: boolean;
    suggestions: string[];
    showSuggestions: boolean;
    suggestionIndex: number;
};

interface SubmitResult {
    success: boolean;
    id?: string;
    error?: string;
    code?: string;
}

function createStockFormStore() {
    const store = writable<FormState>({
        identifier: '',
        notes: '',
        isValid: false,
        errorMessage: '',
        isLoading: false,
        suggestions: [],
        showSuggestions: false,
        suggestionIndex: -1
    });

    const { subscribe, set, update } = store;

    return {
        subscribe,
        reset: () => set({
            identifier: '',
            notes: '',
            isValid: false,
            errorMessage: '',
            isLoading: false,
            suggestions: [],
            showSuggestions: false,
            suggestionIndex: -1
        }),
        
        setIdentifier: (identifier: string) => update(state => ({
            ...state,
            identifier
        })),

        setNotes: (notes: string) => update(state => ({
            ...state,
            notes
        })),

        setErrorMessage: (message: string) => update(state => ({
            ...state,
            errorMessage: message
        })),

        updateSuggestions: async (query: string) => {
            const suggestions = await searchSymbols(query);
            update(state => ({
                ...state,
                suggestions,
                showSuggestions: suggestions.length > 0,
                suggestionIndex: -1
            }));
        },

        selectSuggestion: (symbol: string) => update(state => ({
            ...state,
            identifier: symbol,
            suggestions: [],
            showSuggestions: false
        })),

        validateIdentifier: async (accessToken: string) => {
            update(state => ({ ...state, isLoading: true }));
            
            try {
                const currentState = get(store);
                const { isValid, error } = await validateSymbol(currentState.identifier, accessToken);
                update(state => ({
                    ...state,
                    isValid,
                    errorMessage: error || ''
                }));
            } finally {
                update(state => ({ ...state, isLoading: false }));
            }
        },

        navigateSuggestions: (direction: 'up' | 'down') => update(state => {
            if (!state.showSuggestions) return state;

            const newIndex = direction === 'down'
                ? Math.min(state.suggestionIndex + 1, state.suggestions.length - 1)
                : Math.max(state.suggestionIndex - 1, -1);

            return {
                ...state,
                suggestionIndex: newIndex
            };
        }),

        hideSuggestions: () => update(state => ({
            ...state,
            showSuggestions: false
        })),

        submitForm: async (listName: ListName, accessToken: string): Promise<SubmitResult> => {
            update(state => ({ ...state, isLoading: true }));

            try {
                const currentState = get(store);
                const result = await addStock({
                    identifier: currentState.identifier,
                    notes: currentState.notes,
                    listName,
                    accessToken
                });

                return result;
            } catch (error) {
                update(state => ({
                    ...state,
                    errorMessage: error instanceof Error ? error.message : 'Failed to add stock'
                }));
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to add stock'
                };
            } finally {
                update(state => ({ ...state, isLoading: false }));
            }
        }
    };
}

export const stockForm = createStockFormStore();

export const isFormValid = derived(
    [stockForm, session],
    ([$stockForm, $session]) => {
        return $session?.user && $stockForm.isValid && !$stockForm.isLoading;
    }
);
