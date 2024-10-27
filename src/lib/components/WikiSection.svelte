<script lang="ts">
    import Quill from 'quill';
    import type { QuillOptionsStatic } from 'quill';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';

    export let symbol: string;
    export let section: string;

    let content = '';
    let loading = true;
    let editing = false;
    let error: string | null = null;
    let lastUpdatedBy: string | null = null;
    let lastSaved: string | null = null;
    let wordCount = 0;
    let quillEditor: Quill;

    const quillOptions: QuillOptionsStatic = {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['blockquote', 'code-block'],
                ['clean']
            ],
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        theme: 'snow',
        placeholder: 'Type something...'
    };

    onMount(() => {
        loadContent();
    });

    async function loadContent() {
        loading = true;
        try {
            const { data, error: supabaseError } = await supabase
                .from('company_wiki')
                .select('content, updated_at, user_id')
                .eq('symbol', symbol)
                .eq('section', section)
                .maybeSingle();

            if (supabaseError) throw supabaseError;

            if (data) {
                content = data.content;
                lastSaved = new Date(data.updated_at).toLocaleString();
                updateWordCount();

                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('full_name, username')
                    .eq('id', data.user_id)
                    .single();

                if (userError) {
                    console.error('Error fetching user data:', userError.message);
                    lastUpdatedBy = 'Unknown';
                } else {
                    lastUpdatedBy = userData.full_name || userData.username || 'Unknown';
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

    async function saveContent() {
        error = null;
        try {
            const newContent = quillEditor.root.innerHTML;
            const { error: updateError } = await supabase
                .from('company_wiki')
                .upsert(
                    {
                        symbol,
                        section,
                        content: newContent,
                        user_id: $session?.user?.id
                    },
                    { onConflict: 'symbol,section' }
                );

            if (updateError) throw updateError;

            content = newContent;
            editing = false;
            lastSaved = new Date().toLocaleString();
            lastUpdatedBy = $session?.user?.user_metadata?.full_name || $session?.user?.email || 'Unknown';
            updateWordCount();
        } catch (err) {
            error = (err as Error).message;
            console.error('Error saving content:', error);
        }
    }

    function startEditing() {
        editing = true;
        setTimeout(() => {
            const editorContainer = document.getElementById('quill-editor');
            if (editorContainer) {
                quillEditor = new Quill(editorContainer, quillOptions);
                quillEditor.root.innerHTML = content;
                quillEditor.on('text-change', updateWordCount);
            }
        }, 0);
    }

    function updateWordCount() {
        const text = quillEditor ? quillEditor.getText() : content.replace(/<[^>]*>/g, '');
        wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length;
    }
</script>

<style>
    :global(.ql-toolbar.ql-snow) {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        background-color: var(--bg-secondary, #f3f4f6);
        color: var(--text-primary, #111827);
        border-color: var(--border-color, #d1d5db);
    }
    :global(.ql-container.ql-snow) {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        min-height: 200px;
        background-color: var(--bg-primary, #ffffff);
        color: var(--text-primary, #111827);
        border-color: var(--border-color, #d1d5db);
    }
    :global(.ql-editor) {
        font-size: 16px;
        line-height: 1.5;
        padding: 1rem;
    }
    /* Dark mode adjustments */
    :global(.dark .ql-toolbar.ql-snow) {
        background-color: var(--bg-secondary, #374151);
        color: var(--text-primary, #f9fafb);
        border-color: var(--border-color, #4b5563);
    }
    :global(.dark .ql-container.ql-snow) {
        background-color: var(--bg-primary, #1f2937);
        color: var(--text-primary, #f9fafb);
        border-color: var(--border-color, #4b5563);
    }
    :global(.ql-snow .ql-stroke) {
        stroke: var(--text-primary, #111827);
    }
    :global(.dark .ql-snow .ql-stroke) {
        stroke: var(--text-primary, #f9fafb);
    }
    :global(.ql-snow .ql-fill) {
        fill: var(--text-primary, #111827);
    }
    :global(.dark .ql-snow .ql-fill) {
        fill: var(--text-primary, #f9fafb);
    }
</style>

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
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                <div id="quill-editor"></div>
            </div>
            <div class="flex justify-between items-center mb-4">
                <div>
                    <button on:click={saveContent} class="mr-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-200">Save</button>
                    <button on:click={() => editing = false} class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-200">Cancel</button>
                </div>
                <div class="text-sm text-gray-500">
                    Word count: {wordCount}
                </div>
            </div>
        {:else}
            <div class="prose dark:prose-invert max-w-none mb-4">
                {@html content}
            </div>
            <button on:click={startEditing} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200">Edit</button>
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
