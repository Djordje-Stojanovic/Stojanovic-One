<script lang="ts">
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import WikiSection from '$lib/components/WikiSection.svelte';
  import FileUploader from '$lib/components/FileUploader.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase, db } from '$lib/supabaseClient';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import type { ListName } from '$lib/constants/listNames';
  import StockPageButton from '$lib/components/StockPageButton.svelte';
  import { loadFinancialData } from '$lib/services/companyFinancialsService';
  import { session } from '$lib/stores/sessionStore';

  let symbol = '';
  let stockMetadata: any = null;
  let loading = true;
  let error: string | null = null;
  let companyList: ListName | null = null;
  let syncing = false;
  let syncStatus = '';

  $: symbol = $page.params.symbol;

  async function loadStockMetadata() {
    try {
      const { data, error: fetchError } = await db
        .from('stock_metadata')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (fetchError) throw fetchError;
      stockMetadata = data;
    } catch (err) {
      console.error('Error loading stock metadata:', err);
      error = (err as Error).message;
    }
  }

  function handleFullpageNavigation() {
    if (companyList) {
      goto(`/subprojects/investment-analysis-platform/${companyList.toLowerCase()}/${symbol.toLowerCase()}`);
    }
  }

  async function findCompanyList() {
    try {
      const { data, error: queryError } = await db
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

  async function syncAllData() {
    if (syncing) return;
    syncing = true;
    syncStatus = 'Syncing all financial data...';
    
    try {
      if (!$session?.access_token) {
        throw new Error('No session token available');
      }

      const { data, error: syncError } = await loadFinancialData(symbol, $session.access_token, true);
      if (syncError) throw new Error(syncError);
      if (!data) throw new Error('No data received');

      // Reload stock metadata to reflect changes
      await loadStockMetadata();

      syncStatus = 'All data synced successfully!';
      setTimeout(() => {
        syncStatus = '';
      }, 3000);
      
    } catch (err) {
      console.error('Sync error:', err);
      syncStatus = `Error: ${(err as Error).message}`;
    } finally {
      syncing = false;
    }
  }

  onMount(async () => {
    try {
      await loadStockMetadata();
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
    <!-- Navigation and Sync Buttons -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <!-- Navigation Buttons -->
      <div class="flex items-center gap-4">
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

      <!-- Sync Button - Separated for emphasis -->
      <div class="flex-grow flex justify-end">
        <StockPageButton 
          onClick={syncAllData} 
          disabled={syncing}
          variant={syncing ? 'disabled' : 'primary'}
          class="min-w-[150px] font-bold"
        >
          {#if syncing}
            <span class="flex items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Syncing...
            </span>
          {:else}
            <span class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              Sync All Data
            </span>
          {/if}
        </StockPageButton>
      </div>
    </div>

    {#if syncStatus}
      <div class="mb-4 p-2 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
        {syncStatus}
      </div>
    {/if}

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
