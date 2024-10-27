<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import CompanyInfo from '$lib/components/CompanyInfo.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { allowedMoves } from '$lib/utils/stockMoves';
  import { session } from '$lib/stores/sessionStore';
  import { onMount } from 'svelte';

  // Define interfaces for better type checking
  interface Question {
    id: string;
    user_id: string;
    list_name: string;
    question: string;
    order_index: number;
  }

  interface AnswerData {
    answer: boolean;
    text_answer?: string;
  }

  // State variables
  let stockItem: any;
  let loading = true;
  let error: string | null = null;
  let questions: Question[] = [];
  const answers = writable<{ [key: string]: AnswerData }>({});
  let listName: string;
  let symbol: string;
  const saveStatus = writable<{ [key: string]: 'saving' | 'saved' | 'error' | '' }>({});

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
      // Fetch user_stocks and stock_metadata
      const { data: userStockData, error: userStockError } = await supabase
        .from('user_stocks')
        .select(`
          *,
          stock_metadata!inner(*)
        `)
        .eq('user_id', $session?.user?.id)
        .eq('list_name', listNameParam)
        .eq('stock_metadata.symbol', symbolParam)
        .single();

      if (userStockError) throw userStockError;
      if (!userStockData) throw new Error('Stock not found');

      stockItem = {
        ...userStockData.stock_metadata,
        notes: userStockData.notes,
        list_name: userStockData.list_name,
        id: userStockData.id
      };

      // Fetch meta questions for the current list
      const { data: questionsData, error: questionsError } = await supabase
        .from('meta_questions')
        .select('*')
        .eq('user_id', $session?.user?.id)
        .eq('list_name', listNameParam)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;
      questions = questionsData;

      // Fetch existing answers for this stock
      const { data: answersData, error: answersError } = await supabase
        .from('stock_answers')
        .select('*')
        .eq('user_id', $session?.user?.id)
        .eq('stock_item_id', userStockData.id);

      if (answersError) throw answersError;

      // Map answers to a dictionary
      answers.update(current => {
        current = answersData.reduce((acc, answer) => {
          acc[answer.question_id] = {
            answer: answer.answer,
            text_answer: answer.text_answer,
          };
          return acc;
        }, {});
        return current;
      });

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

  // Update answer for a question
  function updateAnswer(questionId: string, answerValue: boolean, textAnswer: string) {
    answers.update(current => {
      current[questionId] = { answer: answerValue, text_answer: textAnswer };
      return current;
    });
    
    saveStatus.update(current => {
      current[questionId] = 'saving';
      return current;
    });

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
          saveStatus.update(current => {
            current[questionId] = 'error';
            return current;
          });
        } else {
          saveStatus.update(current => {
            current[questionId] = 'saved';
            return current;
          });
          
          // Remove the save status after 5 seconds only if it's 'saved'
          setTimeout(() => {
            saveStatus.update(current => {
              if (current[questionId] === 'saved') {
                delete current[questionId];
              }
              return current;
            });
          }, 5000);
        }
      });
  }

  // Move stock item to a new list
  async function moveItem(event: CustomEvent<{ item: any; newListName: string }>) {
    const { item, newListName } = event.detail;
    if (!newListName) return;

    try {
      // Update the user_stocks table
      const { data, error } = await supabase
        .from('user_stocks')
        .update({ list_name: newListName })
        .eq('id', item.id)
        .select()
        .single();

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

    <!-- Stock Information -->
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
          {#each currentAllowedMoves as moveListName}
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
    <div class="question-list bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Questions</h2>
      {#each questions as question (question.id)}
        <div class="question-item mb-6 last:mb-0">
          <label class="flex items-start mb-2 cursor-pointer group">
            <input
              type="checkbox"
              class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 transition duration-150 ease-in-out"
              checked={$answers[question.id]?.answer ?? false}
              on:change={(e) => {
                if (e.currentTarget instanceof HTMLInputElement) {
                  updateAnswer(question.id, e.currentTarget.checked, $answers[question.id]?.text_answer ?? '');
                }
              }}
            />
            <span class="ml-3 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-150">
              {question.question}
            </span>
          </label>
          <textarea
            class="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition duration-150 ease-in-out resize-none"
            rows="3"
            placeholder="Add your notes here..."
            value={$answers[question.id]?.text_answer || ''}
            on:input={(e) => {
              if (e.currentTarget instanceof HTMLTextAreaElement) {
                updateAnswer(question.id, $answers[question.id]?.answer || false, e.currentTarget.value);
              }
            }}
          ></textarea>
          {#if $saveStatus[question.id]}
            <p class="text-sm mt-1 transition-opacity duration-300 ease-in-out" class:opacity-100={$saveStatus[question.id] !== ''} class:opacity-0={$saveStatus[question.id] === ''}>
              {#if $saveStatus[question.id] === 'saving'}
                <span class="text-yellow-500">Saving...</span>
              {:else if $saveStatus[question.id] === 'saved'}
                <span class="text-green-500">Saved</span>
              {:else if $saveStatus[question.id] === 'error'}
                <span class="text-red-500">Error saving</span>
              {/if}
            </p>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Company Info -->
    <CompanyInfo stockMetadata={stockItem} />
  </div>
{/if}

<style lang="postcss">
  .question-item {
    @apply transition-all duration-300 ease-in-out;
  }
  .question-item:hover {
    @apply transform -translate-y-1;
  }
</style>
