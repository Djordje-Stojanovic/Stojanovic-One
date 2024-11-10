<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import WikiDiff from './WikiDiff.svelte';

    export let symbol: string;
    export let section: string;
    export let onRevert: (content: string) => void;
    export let currentContent: string;

    let historyEntries: any[] = [];
    let loadingHistory = false;
    let error: string | null = null;
    let selectedVersionIndex: number | null = null;

    onMount(() => {
        loadHistory();
    });

    async function loadHistory() {
        loadingHistory = true;
        try {
            const { data, error: historyError } = await supabase
                .from('company_wiki_history')
                .select('id, content, updated_at, user_id')
                .eq('symbol', symbol)
                .eq('section', section)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (historyError) throw historyError;

            if (data) {
                // Fetch user data separately for each history entry
                historyEntries = await Promise.all(
                    data.map(async (entry) => {
                        const { data: userData } = await supabase
                            .from('profiles')
                            .select('full_name, username')
                            .eq('id', entry.user_id)
                            .single();

                        return {
                            ...entry,
                            user: userData || { full_name: 'Unknown', username: 'Unknown' }
                        };
                    })
                );
            }
        } catch (err) {
            console.error('Error loading history:', err);
            error = (err as Error).message;
        } finally {
            loadingHistory = false;
        }
    }

    function selectVersion(index: number) {
        if (selectedVersionIndex === index) {
            selectedVersionIndex = null;
        } else {
            selectedVersionIndex = index;
        }
    }

    function getComparisonContent(index: number) {
        // If it's the most recent version in history, compare with current content
        if (index === 0) {
            return currentContent;
        }
        // Otherwise compare with the previous version in history
        return historyEntries[index - 1].content;
    }
</script>

<div class="mt-4">
    <h3 class="text-lg font-semibold mb-2">Version History</h3>
    {#if loadingHistory}
        <div class="flex justify-center items-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong class="font-bold">Error:</strong>
            <span class="block sm:inline">{error}</span>
        </div>
    {:else}
        <div class="space-y-2">
            {#each historyEntries as entry, index}
                <div class="border dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                        class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-between items-center transition-colors duration-200"
                        on:click={() => selectVersion(index)}
                    >
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(entry.updated_at).toLocaleString()} by {entry.user.full_name || entry.user.username}
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                on:click|stopPropagation={() => onRevert(entry.content)}
                                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200"
                            >
                                Revert to this version
                            </button>
                            <svg
                                class="w-4 h-4 transform transition-transform duration-200 {selectedVersionIndex === index ? 'rotate-180' : ''}"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>
                    {#if selectedVersionIndex === index}
                        <div class="border-t dark:border-gray-700">
                            <WikiDiff
                                oldContent={entry.content}
                                newContent={getComparisonContent(index)}
                            />
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    button:focus {
        outline: none;
    }
</style>
