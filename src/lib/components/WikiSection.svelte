<script lang="ts">
    import { Editor, EditorContent } from 'svelte-tiptap';
    import StarterKit from '@tiptap/starter-kit';
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

    async function loadContent() {
        loading = true;
        try {
            const { data, error: supabaseError } = await supabase
                .from('company_wiki')
                .select('content, updated_at, user_id')
                .eq('symbol', symbol)
                .eq('section', section);

            if (supabaseError) throw supabaseError;

            if (data && data.length > 0) {
                const wikiData = data[0];
                content = wikiData.content;
                
                if (wikiData.user_id) {
                    const { data: userData, error: userError } = await supabase
                        .rpc('get_user_email', { user_id: wikiData.user_id });

                    if (userError) throw userError;
                    lastUpdatedBy = userData;
                }
            }
        } catch (err) {
            error = (err as Error).message;
        } finally {
            loading = false;
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
            <!-- Add your editing logic here -->
        {:else}
            {@html content}
            <button on:click={() => (editing = true)} class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
        {/if}
    {/if}
    {#if lastUpdatedBy}
        <p class="text-sm text-gray-500">Last updated by {lastUpdatedBy}</p>
    {/if}
</div>
