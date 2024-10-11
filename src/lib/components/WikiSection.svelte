<script lang="ts">
    import QuillEditor from 'svelte-quill';
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
          .select('content, updated_at, user_id, users(username)')
          .eq('symbol', symbol)
          .eq('section', section)
          .single();
  
        if (supabaseError && supabaseError.code !== 'PGRST116') {
          // Ignore "No rows found" error
          throw supabaseError;
        }
  
        content = data ? data.content : '';
        lastUpdatedBy = data ? data.users.username : null;
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    async function saveContent() {
      try {
        const { user } = $session;
  
        if (!user) {
          throw new Error('You must be logged in to edit this section.');
        }
  
        // Begin transaction
        const { data: upsertData, error: upsertError } = await supabase
          .from('company_wiki')
          .upsert({
            symbol,
            section,
            content,
            updated_at: new Date(),
            user_id: user.id,
          })
          .select();
  
        if (upsertError) throw upsertError;
  
        const wikiEntry = upsertData[0];
  
        // Insert into history table
        const { error: historyError } = await supabase.from('company_wiki_history').insert({
          wiki_id: wikiEntry.id,
          symbol,
          section,
          content,
          updated_at: new Date(),
          user_id: user.id,
        });
  
        if (historyError) throw historyError;
  
        editing = false;
      } catch (err) {
        error = err.message;
      }
    }
  
    onMount(() => {
      loadContent();
    });
  </script>
  
  <div class="my-8">
    <h2 class="text-2xl font-bold">{section}</h2>
    {#if loading}
      <div>Loading...</div>
    {:else if error}
      <div class="text-red-500">{error}</div>
    {:else}
      {#if editing}
        <QuillEditor bind:value={content} />
        <button on:click={saveContent} class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        <button on:click={() => (editing = false)} class="mt-2 px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
      {:else}
        {@html content}
        <button on:click={() => (editing = true)} class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
      {/if}
    {/if}
    {#if lastUpdatedBy}
      <p class="text-sm text-gray-500">Last updated by {lastUpdatedBy}</p>
    {/if}
  </div>