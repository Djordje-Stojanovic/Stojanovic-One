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

    const quillOptions = {
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ header: [1, 2, 3, false] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        },
        placeholder: 'Type something...',
        theme: 'snow'
    };

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

                if (data.user_id) {
                    const { data: userData, error: userError } = await supabase
                        .rpc('get_user_email', { user_id: data.user_id });

                    if (userError) throw userError;
                    lastUpdatedBy = userData;
                }
            } else {
                content = '';
            }
        } catch (err) {
            error = (err as Error).message;
        } finally {
            loading = false;
        }
    }

    async function saveContent() {
        error = null;
        try {
            const { error: updateError } = await supabase.from('company_wiki').upsert(
                {
                    symbol,
                    section,
                    content,
                    user_id: $session?.user?.id
                },
                { onConflict: 'symbol,section' }
            );

            if (updateError) throw updateError;

            editing = false;
            lastUpdatedBy = $session?.user?.email || null;
        } catch (err) {
            error = (err as Error).message;
        }
    }

    onMount(loadContent);
</script>

<div class="my-8">
    <h2 class="text-2xl font-bold">{section}</h2>
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <div class="text-red-500">{error}</div>
    {:else}
        {#if editing}
            <div class="bg-white dark:bg-gray-800">
                <div
                    class="editor"
                    use:quill={quillOptions}
                    on:text-change={(e) => (content = e.detail.html)}
                ></div>
            </div>
            <button on:click={saveContent} class="mt-2 px-4 py-2 bg-green-600 text-white rounded">
                Save
            </button>
            <button
                on:click={() => (editing = false)}
                class="mt-2 ml-2 px-4 py-2 bg-gray-600 text-white rounded"
            >
                Cancel
            </button>
        {:else}
            <div class="prose dark:prose-invert">
                {@html content}
            </div>
            <button
                on:click={() => (editing = true)}
                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
                Edit
            </button>
        {/if}
    {/if}
    {#if lastUpdatedBy}
        <p class="text-sm text-gray-500 mt-2">Last updated by {lastUpdatedBy}</p>
    {/if}
</div>

<style>
    .editor :global(.ql-toolbar.ql-snow) {
        border: 1px solid #ccc;
        border-bottom: none;
        border-radius: 0.5rem 0.5rem 0 0;
    }

    .editor :global(.ql-container.ql-snow) {
        border: 1px solid #ccc;
        border-radius: 0 0 0.5rem 0.5rem;
        min-height: 200px;
    }
</style>