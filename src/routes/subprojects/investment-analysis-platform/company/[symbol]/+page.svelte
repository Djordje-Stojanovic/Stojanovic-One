<script lang="ts">
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import WikiSection from '$lib/components/WikiSection.svelte';
  import FileUploader from '$lib/components/FileUploader.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

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

  function navigateToFinancials() {
    goto(`/subprojects/investment-analysis-platform/company/${symbol}/financials`);
  }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-8">
    {#if loading}
      <div class="flex items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <p class="text-red-500">{error}</p>
    {:else}
      <!-- Company Info Section -->
      <CompanyInfo {stockMetadata} />

      <!-- Financials Button -->
      <button
        class="mb-6 mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        on:click={navigateToFinancials}
      >
        View Financial Statements
      </button>

      <!-- Wiki Sections -->
      <WikiSection {symbol} section="Founding and Early History" />
      <WikiSection {symbol} section="Key Milestones" />
      <WikiSection {symbol} section="Current State and Future Outlook" />
      <WikiSection {symbol} section="Business Model" />
      <WikiSection {symbol} section="Competitors" />
      <WikiSection {symbol} section="Risks" />


      <!-- File Upload -->
      <FileUploader {symbol} />
    {/if}
  </div>
</div>
