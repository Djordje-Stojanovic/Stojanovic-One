<script lang="ts">
    import { onMount } from 'svelte';
    import { session } from '$lib/stores/sessionStore';
    import WikiEditor from './wiki/WikiEditor.svelte';
    import WikiHistory from './wiki/WikiHistory.svelte';
    import { loadWikiContent, loadUserData, saveWikiContent, revertContent } from '$lib/services/wikiService';
    import type { WikiContent } from '$lib/types/wiki';

    export let symbol: string;
    export let section: string;

    let content = '';
    let loading = true;
    let editing = false;
    let error: string | null = null;
    let lastUpdatedBy: string | null = null;
    let lastSaved: string | null = null;
    let showHistory = false;

    onMount(() => {
        loadContent();
    });

    async function loadContent() {
        loading = true;
        try {
            const wikiContent = await loadWikiContent(symbol, section);

            if (wikiContent) {
                content = wikiContent.content;
                lastSaved = new Date(wikiContent.updated_at).toLocaleString();

                if (wikiContent.user_id) {
                    const userData = await loadUserData(wikiContent.user_id);
                    lastUpdatedBy = userData.full_name || userData.username || 'Unknown';
                } else {
                    lastUpdatedBy = 'Unknown';
                }
            } else {
                content = '';
                lastUpdatedBy = null;
                lastSaved = null;
            }
        } catch (err) {
            error = (err as Error).message;
            console.error('Error loading content:', error);
        } finally {
            loading = false;
        }
    }

    async function handleSave(newContent: string) {
        error = null;
        try {
            if (!$session?.user?.id) {
                throw new Error('You must be logged in to save changes');
            }
            
            await saveWikiContent(symbol, section, newContent, $session.user.id);
            content = newContent;
            editing = false;
            lastSaved = new Date().toLocaleString();
            lastUpdatedBy = $session?.user?.user_metadata?.full_name || $session?.user?.email || 'Unknown';
            // Reload history if it's being shown
            if (showHistory) {
                await loadContent();
            }
        } catch (err) {
            error = (err as Error).message;
            console.error('Error saving content:', error);
        }
    }

    async function handleRevert(oldContent: string) {
        try {
            if (!$session?.user?.id) {
                throw new Error('You must be logged in to revert changes');
            }

            await revertContent(symbol, section, oldContent, $session.user.id);
            content = oldContent;
            showHistory = false;
            await loadContent();
        } catch (err) {
            error = (err as Error).message;
            console.error('Error reverting content:', err);
        }
    }

    function handleEdit() {
        if (!$session?.user?.id) {
            error = 'You must be logged in to edit content';
            return;
        }
        editing = true;
        error = null;
    }
</script>

<div class="my-8">
    <h2 class="text-2xl font-bold mb-4">{section}</h2>
    {#if loading}
        <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error:</strong>
            <span class="block sm:inline">{error}</span>
        </div>
    {:else}
        {#if editing}
            <WikiEditor
                {content}
                onSave={handleSave}
                onCancel={() => editing = false}
            />
        {:else}
            <div class="prose dark:prose-invert max-w-none mb-4">
                {@html content}
            </div>
            <div class="flex gap-2">
                <button 
                    on:click={handleEdit}
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
                >
                    Edit
                </button>
                <button 
                    on:click={() => showHistory = !showHistory}
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-200"
                >
                    {showHistory ? 'Hide History' : 'Show History'}
                </button>
            </div>
        {/if}

        {#if showHistory}
            <WikiHistory
                {symbol}
                {section}
                onRevert={handleRevert}
                currentContent={content}
            />
        {/if}
    {/if}
    
    <div class="mt-4 text-sm text-gray-500">
        {#if lastUpdatedBy}
            <p>Last updated by {lastUpdatedBy}</p>
        {/if}
        {#if lastSaved}
            <p>Last saved: {lastSaved}</p>
        {/if}
    </div>
</div>
