<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { session } from '$lib/stores/sessionStore';

  let symbol = $page.params.symbol;
  let financialData: any = {
    incomeStatements: [],
    balanceSheets: [],
    cashFlowStatements: []
  };
  let loading = true;
  let error: string | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  let retryLoading = false;

  async function fetchFinancialData() {
    if (!$session) {
      goto('/login?redirected=true&from=' + $page.url.pathname);
      return;
    }

    loading = true;
    error = null;

    try {
      const [incomeStatementsResponse, balanceSheetsResponse, cashFlowStatementsResponse] = await Promise.all([
        supabase.from('income_statements').select('*').eq('symbol', symbol).order('date', { ascending: false }),
        supabase.from('balance_sheets').select('*').eq('symbol', symbol).order('date', { ascending: false }),
        supabase.from('cash_flow_statements').select('*').eq('symbol', symbol).order('date', { ascending: false })
      ]);

      if (incomeStatementsResponse.error) throw incomeStatementsResponse.error;
      if (balanceSheetsResponse.error) throw balanceSheetsResponse.error;
      if (cashFlowStatementsResponse.error) throw cashFlowStatementsResponse.error;

      financialData = {
        incomeStatements: incomeStatementsResponse.data || [],
        balanceSheets: balanceSheetsResponse.data || [],
        cashFlowStatements: cashFlowStatementsResponse.data || []
      };

      if (financialData.incomeStatements.length === 0 && financialData.balanceSheets.length === 0 && financialData.cashFlowStatements.length === 0) {
        await loadFinancialData();
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred while fetching financial data';
    } finally {
      loading = false;
    }
  }

  async function loadFinancialData() {
    if (retryCount >= MAX_RETRIES) {
      error = 'Maximum retry attempts reached. Please try again later.';
      return;
    }

    loading = true;
    retryLoading = true;
    error = null;

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        goto('/login?redirected=true&from=' + $page.url.pathname);
        return;
      }

      const response = await fetch(`/api/financial-data/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          goto('/login?redirected=true&from=' + $page.url.pathname);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      financialData = {
        incomeStatements: data.incomeStatements || [],
        balanceSheets: data.balanceSheets || [],
        cashFlowStatements: data.cashFlowStatements || []
      };
      retryCount = 0; // Reset retry count on successful fetch
    } catch (err) {
      console.error('Error loading financial data:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        error = 'Network error. Please check your internet connection and try again.';
      } else {
        error = err instanceof Error ? err.message : 'An unknown error occurred while loading financial data';
      }
      retryCount++;
    } finally {
      loading = false;
      retryLoading = false;
    }
  }

  onMount(() => {
    fetchFinancialData();
  });

  function formatCurrency(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<svelte:head>
  <title>{symbol} Financial Statements - Investment Analysis Platform</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-6 text-3xl font-bold">{symbol} Financial Statements</h1>

  {#if loading && !retryLoading}
    <LoadingSpinner />
  {:else if error}
    <p class="text-red-500">{error}</p>
    {#if retryCount < MAX_RETRIES}
      <button
        class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        on:click={loadFinancialData}
        disabled={retryLoading}
      >
        {#if retryLoading}
          <LoadingSpinner size="small" />
        {:else}
          Retry Loading Financial Data
        {/if}
      </button>
    {/if}
  {:else if financialData.incomeStatements.length > 0 || financialData.balanceSheets.length > 0 || financialData.cashFlowStatements.length > 0}
    <div class="mb-8">
      <h2 class="mb-4 text-2xl font-bold">Income Statements</h2>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Revenue</th>
              <th class="px-4 py-2">Net Income</th>
              <th class="px-4 py-2">EPS</th>
            </tr>
          </thead>
          <tbody>
            {#each financialData.incomeStatements as statement}
              <tr>
                <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.revenue)}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.net_income)}</td>
                <td class="border px-4 py-2">{statement.eps?.toFixed(2) ?? 'N/A'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-4 text-2xl font-bold">Balance Sheets</h2>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Total Assets</th>
              <th class="px-4 py-2">Total Liabilities</th>
              <th class="px-4 py-2">Total Equity</th>
            </tr>
          </thead>
          <tbody>
            {#each financialData.balanceSheets as statement}
              <tr>
                <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.total_assets)}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.total_liabilities)}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.total_stockholders_equity)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-4 text-2xl font-bold">Cash Flow Statements</h2>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Operating Cash Flow</th>
              <th class="px-4 py-2">Investing Cash Flow</th>
              <th class="px-4 py-2">Financing Cash Flow</th>
            </tr>
          </thead>
          <tbody>
            {#each financialData.cashFlowStatements as statement}
              <tr>
                <td class="border px-4 py-2">{new Date(statement.date).toLocaleDateString()}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.net_cash_provided_by_operating_activities)}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.net_cash_used_for_investing_activities)}</td>
                <td class="border px-4 py-2">{formatCurrency(statement.net_cash_used_provided_by_financing_activities)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <p>No financial data available.</p>
    <button
      class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      on:click={loadFinancialData}
      disabled={retryLoading}
    >
      {#if retryLoading}
        <LoadingSpinner size="small" />
      {:else}
        Load Financial Data
      {/if}
    </button>
  {/if}
</div>
