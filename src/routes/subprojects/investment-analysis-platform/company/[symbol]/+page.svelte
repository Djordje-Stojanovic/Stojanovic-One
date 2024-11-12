<script lang="ts">
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import WikiSection from '$lib/components/WikiSection.svelte';
  import FileUploader from '$lib/components/FileUploader.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import type { ListName } from '$lib/constants/listNames';
  import StockPageButton from '$lib/components/StockPageButton.svelte';

  let symbol = '';
  let stockMetadata: any = null;
  let loading = true;
  let error: string | null = null;
  let companyList: ListName | null = null;

  $: symbol = $page.params.symbol;

  function handleFullpageNavigation() {
    if (companyList) {
      goto(`/subprojects/investment-analysis-platform/${companyList.toLowerCase()}/${symbol.toLowerCase()}`);
    }
  }

  async function findCompanyList() {
    try {
      const { data, error: queryError } = await supabase
        .from('user_stocks')
        .select(`
          list_name,
          stock_metadata!inner (
            symbol
          )
        `)
        .eq('stock_metadata.symbol', symbol.toUpperCase())
        .single();

      if (queryError) throw queryError;
      if (data?.list_name) {
        companyList = data.list_name as ListName;
      }
    } catch (e) {
      console.error('Error finding company list:', e);
      companyList = null;
    }
  }

  onMount(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('stock_metadata')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (fetchError) throw fetchError;
      stockMetadata = data;
      await findCompanyList();
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation Buttons -->
    <div class="flex space-x-4 mb-6">
      <StockPageButton onClick={() => goto('/subprojects/investment-analysis-platform')}>
        Go to IAP
      </StockPageButton>

      {#if companyList}
        <StockPageButton onClick={handleFullpageNavigation}>
          Go to Fullpage
        </StockPageButton>
      {/if}

      <StockPageButton variant="disabled">
        Wiki
      </StockPageButton>

      <StockPageButton onClick={() => goto(`/subprojects/investment-analysis-platform/company/${symbol}/financials`)}>
        Financials
      </StockPageButton>
    </div>

    {#if loading}
      <div class="flex items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <p class="text-red-500">{error}</p>
    {:else}
      <!-- Company Info Section -->
      <CompanyInfo {stockMetadata} />

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
