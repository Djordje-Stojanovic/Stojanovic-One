<script lang="ts">
  import { db } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { allowedMoves } from '$lib/utils/stockMoves';
  import { session } from '$lib/stores/sessionStore';
  import { onMount } from 'svelte';
  import StockPageButton from '$lib/components/StockPageButton.svelte';
  import QuestionSection from '$lib/components/QuestionSection.svelte';

  // State variables
  let stockItem: any;
  let loading = true;
  let error: string | null = null;
  let questions: any[] = [];
  let listName: string;
  let symbol: string;
  let incomeStatements: any[] = [];

  // Compute allowed moves based on the current stock item
  $: currentAllowedMoves = stockItem ? allowedMoves[stockItem.list_name as keyof typeof allowedMoves] || [] : [];

  // Helper function to capitalize words
  function capitalizeWords(str: string) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  // Load data for the current stock
  async function loadData(listNameParam: string, symbolParam: string) {
    loading = true;
    error = null;
    try {
      // Fetch user_stocks, stock_metadata, and income statements in parallel
      const [userStockResult, incomeStatementsResult] = await Promise.all([
        db
          .from('user_stocks')
          .select(`
            *,
            stock_metadata!inner(*)
          `)
          .eq('user_id', $session?.user?.id)
          .eq('list_name', listNameParam)
          .eq('stock_metadata.symbol', symbolParam)
          .single(),
        
        db
          .from('income_statements')
          .select('*')
          .eq('symbol', symbolParam)
          .order('date', { ascending: false })
      ]);

      if (userStockResult.error) throw userStockResult.error;
      if (!userStockResult.data) throw new Error('Stock not found');

      stockItem = {
        ...userStockResult.data.stock_metadata,
        notes: userStockResult.data.notes,
        list_name: userStockResult.data.list_name,
        id: userStockResult.data.id
      };

      if (incomeStatementsResult.error) throw incomeStatementsResult.error;
      incomeStatements = incomeStatementsResult.data || [];

      // Fetch meta questions for the current list
      const { data: questionsData, error: questionsError } = await db
        .from('meta_questions')
        .select('*')
        .eq('user_id', $session?.user?.id)
        .eq('list_name', listNameParam)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;
      questions = questionsData;

      loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      loading = false;
      error = error instanceof Error ? error.message : 'An unknown error occurred';
    }
  }

  // Initialize data on component mount
  onMount(() => {
    listName = capitalizeWords(decodeURIComponent($page.params.listName));
    symbol = $page.params.symbol.toUpperCase();
    if (!$session) {
      goto('/login?redirected=true&from=' + $page.url.pathname);
      return;
    }
    loadData(listName, symbol);
  });

  // Move stock item to a new list
  async function moveItem(newListName: string) {
    if (!newListName) return;

    try {
      const { error } = await db
        .from('user_stocks')
        .update({ list_name: newListName })
        .eq('id', stockItem.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state before navigation
      stockItem = {
        ...stockItem,
        list_name: newListName
      };

      // Navigate to the new route
      goto(
        `/subprojects/investment-analysis-platform/${encodeURIComponent(newListName)}/${encodeURIComponent(
          stockItem.symbol.toLowerCase()
        )}`
      );
    } catch (e) {
      console.error('Error moving item:', e);
      alert('Failed to move item');
    }
  }

  // Update when URL params change
  $: {
    const newListName = decodeURIComponent($page.params.listName);
    const newSymbol = $page.params.symbol.toUpperCase();
    if (newListName !== listName || newSymbol !== symbol) {
      listName = capitalizeWords(newListName);
      symbol = newSymbol;
      loadData(listName, symbol);
    }
  }
</script>

<svelte:head>
  <title>{symbol} - Investment Analysis Platform</title>
</svelte:head>

{#if loading}
  <div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
    <LoadingSpinner size="w-12 h-12" />
  </div>
{:else if error}
  <div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
    <p class="text-red-500">{error}</p>
  </div>
{:else}
  <div class="container mx-auto px-4 py-8">
    <ProgressBar currentStatus={stockItem.list_name} />

    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center">
        <img
          src={`https://assets.parqet.com/logos/symbol/${stockItem.symbol}?format=png`}
          alt={`${stockItem.symbol} logo`}
          class="mr-4 h-12 w-12"
          on:error={(e) => {
            if (e.target instanceof HTMLImageElement) {
              e.target.style.display = 'none';
            }
          }}
        />
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{stockItem.symbol}</h1>
      </div>
      <div class="flex items-center space-x-4">
        <StockPageButton onClick={() => goto(`/subprojects/investment-analysis-platform/company/${symbol}`)}>
          Go to Wiki
        </StockPageButton>
        
        <StockPageButton onClick={() => goto(`/subprojects/investment-analysis-platform/company/${symbol}/financials`)}>
          Financials
        </StockPageButton>
        
        <select
          on:change={(e) => {
            if (e.target instanceof HTMLSelectElement && e.target.value) {
              moveItem(e.target.value);
            }
          }}
          class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <option value="">Move to...</option>
          {#each currentAllowedMoves as moveListName}
            <option value={moveListName}>{moveListName}</option>
          {/each}
        </select>
        
        <StockPageButton onClick={() => goto(`/subprojects/investment-analysis-platform?list=${encodeURIComponent(stockItem.list_name)}`)}>
          Back to List
        </StockPageButton>
      </div>
    </div>

    <QuestionSection {stockItem} {questions} />
    <CompanyInfo stockMetadata={stockItem} {incomeStatements} />
  </div>
{/if}
