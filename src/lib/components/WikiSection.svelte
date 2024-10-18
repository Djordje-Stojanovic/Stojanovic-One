<script lang="ts">
    import { quill } from 'svelte-quill';
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { session } from '$lib/stores/sessionStore';

    export let symbol: string;
    export let section: string;

    let content = '';
    let loading = true;
    let editing = false;
    let error: string | null = null;
    let lastUpdatedBy: string | null = null;
    let quillInstance: any;

    const quillOptions = {
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'header': [1, 2, 3, false] }],
                ['link', 'image'],
                ['clean']
            ]
        },
        theme: 'snow'
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
                console.log('Content loaded from database:', content);

                // Fetch user information
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', data.user_id)
                    .maybeSingle();

                if (userError) {
                    console.error('Error fetching user data:', userError.message);
                    lastUpdatedBy = 'Unknown';
                } else {
                    lastUpdatedBy = userData?.full_name || 'Unknown';
                }
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
            const newContent = quillInstance.root.innerHTML;
            console.log('Saving content:', newContent);
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

            content = newContent; // Update local content
            editing = false;
            console.log('Content saved successfully');
        } catch (err) {
            error = (err as Error).message;
            console.error('Error saving content:', error);
        }
    }

    function startEditing() {
        console.log('Starting edit mode. Current content:', content);
        editing = true;
        // Force a re-render of the Quill editor
        setTimeout(() => {
            if (quillInstance) {
                const delta = quillInstance.clipboard.convert(content);
                quillInstance.setContents(delta);
                console.log('Content loaded into editor after timeout');
            }
        }, 0);
    }

    function handleQuillReady(e: CustomEvent) {
        console.log('Quill Ready event fired');
        quillInstance = e.detail;
        console.log('Quill Instance:', quillInstance);
        console.log('Content to Load:', content);
        if (quillInstance && content) {
            const delta = quillInstance.clipboard.convert(content);
            quillInstance.setContents(delta);
            console.log('Content loaded into editor');
        } else {
            console.log('Failed to load content: ', quillInstance ? 'No content' : 'No Quill instance');
        }
    }

    $: if (quillInstance && content && editing) {
        console.log('Reactive content update detected');
        const delta = quillInstance.clipboard.convert(content);
        quillInstance.setContents(delta);
    }
</script>

<style>
    .editor :global(.ql-toolbar.ql-snow) {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
    }
    .editor :global(.ql-container.ql-snow) {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        min-height: 200px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }
    .editor :global(.ql-editor) {
        font-size: 16px;
        line-height: 1.5;
        padding: 1rem;
    }
    /* Dark mode adjustments */
    :global(.dark) .editor :global(.ql-toolbar.ql-snow) {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
    }
    :global(.dark) .editor :global(.ql-container.ql-snow) {
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }
</style>

<div class="my-8">
    <h2 class="text-2xl font-bold">{section}</h2>
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <div class="text-red-500">{error}</div>
    {:else}
        {#if editing}
            <div class="editor bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                <div
                    use:quill={{
                        ...quillOptions,
                        placeholder: 'Type something...',
                        modules: {
                            ...quillOptions.modules,
                            history: {
                                delay: 2000,
                                maxStack: 500,
                                userOnly: true
                            }
                        }
                    }}
                    on:text-change={(e) => content = e.detail.html}
                    on:quill-ready={handleQuillReady}
                >{content}</div>
            </div>
            <button on:click={saveContent} class="mr-2 px-4 py-2 bg-green-600 text-white rounded">Save</button>
            <button on:click={() => editing = false} class="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
        {:else}
            <div class="prose dark:prose-invert">
                {@html content}
            </div>
            <button on:click={startEditing} class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
        {/if}
    {/if}
    {#if lastUpdatedBy}
        <p class="text-sm text-gray-500 mt-2">Last updated by {lastUpdatedBy}</p>
    {/if}
</div>
