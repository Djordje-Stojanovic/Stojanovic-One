<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import QuestionList from '$lib/components/QuestionList.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { allowedMoves } from '$lib/utils/stockMoves';
  import { session } from '$lib/stores/sessionStore';

  interface Question {
    id: string;
    user_id: string;
    list_name: string;
    question: string;
    order_index: number;
  }

  let stockItem: any;
  let companyInfo: any = {};
  let loading = true;
  let error: string | null = null;
  let questions: Question[] = [];
  let answers: { [key: string]: AnswerData } = {};

  interface AnswerData {
    answer: boolean;
    text_answer?: string;
  }

  let listName: string;
  let symbol: string;

  // State for save notifications
  let saveStatus: { [key: string]: 'saving' | 'saved' | 'error' | '' } = {};

  function capitalizeWords(str: string) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  $: {
    listName = capitalizeWords(decodeURIComponent($page.params.listName));
    symbol = $page.params.symbol.toUpperCase();
    loadData(listName, symbol);
  }

  async function loadData(listNameParam: string, symbolParam: string) {
    loading = true;
    error = null;
    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        if (typeof window !== 'undefined') {
          goto('/login?redirected=true&from=' + $page.url.pathname);
        }
        return;
      }

      // Fetch user_stocks and stock_metadata
      const { data: userStockData, error: userStockError } = await supabase
        .from('user_stocks')
        .select(`
          *,
          stock_metadata!inner(*)
        `)
        .eq('user_id', session.user.id)
        .eq('list_name', listNameParam)
        .eq('stock_metadata.symbol', symbolParam.toUpperCase())
        .single();

      if (userStockError) throw userStockError;
      if (!userStockData) throw new Error('Stock not found');

      stockItem = {
        ...userStockData.stock_metadata,
        notes: userStockData.notes,
        list_name: userStockData.list_name,
        id: userStockData.id // Include the user_stocks id
      };

      // **Fetch meta questions for the current list**
      const { data: questionsData, error: questionsError } = await supabase
        .from('meta_questions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('list_name', listNameParam)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      questions = questionsData;

      // **Fetch existing answers for this stock**
      const { data: answersData, error: answersError } = await supabase
        .from('stock_answers')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('stock_item_id', userStockData.id);

      if (answersError) throw answersError;

      // Map answers to a dictionary
      answers = {};
      for (const answer of answersData) {
        answers[answer.question_id] = {
          answer: answer.answer,
          text_answer: answer.text_answer,
        };
      }

      loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      loading = false;
      error =
        error instanceof Error ? error.message : 'An unknown error occurred';
    }
  }

  function updateAnswer(questionId: string, answerValue: boolean, textAnswer: string) {
    answers[questionId] = { answer: answerValue, text_answer: textAnswer };
    
    saveStatus[questionId] = 'saving';
    saveStatus = { ...saveStatus }; // Trigger reactivity

    supabase
      .from('stock_answers')
      .upsert({
        question_id: questionId,
        stock_item_id: stockItem.id,
        list_name: stockItem.list_name,
        answer: answerValue,
        text_answer: textAnswer,
        user_id: $session?.user?.id
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error updating answer:', error);
          saveStatus[questionId] = 'error';
        } else {
          saveStatus[questionId] = 'saved';
        }
        saveStatus = { ...saveStatus }; // Trigger reactivity
        
        // Remove the save status after 5 seconds only if it's 'saved'
        if (saveStatus[questionId] === 'saved') {
          setTimeout(() => {
            if (saveStatus[questionId] === 'saved') {
              delete saveStatus[questionId];
              saveStatus = { ...saveStatus }; // Trigger reactivity
            }
          }, 5000);
        }
      });
  }

  async function moveItem(event: CustomEvent<{ item: any; newListName: string }>) {
    const { item, newListName } = event.detail;
    if (!newListName) return;

    try {
      // Update the user_stocks table
      const { data, error } = await supabase
        .from('user_stocks')
        .update({ list_name: newListName })
        .eq('id', item.id);

      if (error) throw error;

      // Update the local stockItem's list_name
      stockItem.list_name = newListName;

      // Navigate to the new route corresponding to the new list
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


	function updateCompanyInfo(detail: any): void {
		throw new Error('Function not implemented.');
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
    <!-- Progress Bars -->
    <ProgressBar currentStatus={stockItem.list_name} />

    <!-- Existing Content -->
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
        <select
          on:change={(e) => {
            if (e.target instanceof HTMLSelectElement && e.target.value) {
              const newListName = e.target.value;
              moveItem(new CustomEvent('moveItem', { detail: { item: stockItem, newListName } }));
            }
          }}
          class="rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <option value="">Move to...</option>
          {#each allowedMoves[stockItem.list_name] || [] as moveListName}
            <option value={moveListName}>{moveListName}</option>
          {/each}
        </select>
        <button
          on:click={() => goto(`/subprojects/investment-analysis-platform?list=${encodeURIComponent(stockItem.list_name)}`)}
          class="rounded bg-primary-600 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Back to List
        </button>
      </div>
    </div>
    <!-- Questions Section -->
    <QuestionList
      {questions}
      {answers}
      {updateAnswer}
      {saveStatus}
    />

    <!-- Company Info -->
    <CompanyInfo stockMetadata={stockItem} />
  </div>
{/if}