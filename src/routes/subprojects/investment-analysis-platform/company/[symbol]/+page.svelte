<script lang="ts">
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import WikiSection from '$lib/components/WikiSection.svelte';
  import FileUploader from '$lib/components/FileUploader.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { browser } from '$app/environment';

  let symbol = '';
  let stockMetadata: any = null;
  let loading = true;
  let error: string | null = null;

  $: symbol = $page.params.symbol;

  onMount(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('stock_metadata')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (fetchError) throw fetchError;
      stockMetadata = data;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-8">
    {#if loading}
      <p>Loading...</p>
    {:else if error}
      <p class="text-red-500">{error}</p>
    {:else}
      <!-- Company Info -->
      <CompanyInfo {stockMetadata} />

      <!-- Wiki Sections -->
      <WikiSection {symbol} section="History" />
      <WikiSection {symbol} section="Business Model" />
      <WikiSection {symbol} section="Competitors" />
      <WikiSection {symbol} section="Risks" />

      <!-- File Upload -->
      <FileUploader {symbol} />
    {/if}
  </div>
</div>
