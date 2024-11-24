<!-- E:\Stojanovic-One\src\routes\subprojects\investment-analysis-platform\meta-questions\+page.svelte -->

<script lang="ts">
  import { db } from '$lib/supabaseClient';
  import { session } from '$lib/stores/sessionStore';
  import { listNames } from '$lib/constants/listNames';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  interface MetaQuestion {
    id: string;
    user_id: string;
    list_name: string;
    question: string;
    order_index: number;
  }

  let lists = listNames;
  let selectedList: string = lists[0];
  let questions: MetaQuestion[] = [];
  let newQuestionText: string = '';
  let loading = false;
  let error: string | null = null;

  onMount(() => {
    if (!$session) {
      goto('/login?redirected=true&from=' + $page.url.pathname);
      return;
    }
    loadQuestions();
  });

  $: if (selectedList) {
    loadQuestions();
  }

  async function loadQuestions() {
    if (!$session || !selectedList) return;
    loading = true;
    const { data, error: loadError } = await db
      .from('meta_questions')
      .select('*')
      .eq('user_id', $session.user.id)
      .eq('list_name', selectedList)
      .order('order_index', { ascending: true });
    if (loadError) {
      console.error('Error loading questions:', loadError);
      error = loadError.message;
    } else {
      questions = data as MetaQuestion[];
    }
    loading = false;
  }

  async function addQuestion() {
    if (!$session || !newQuestionText.trim()) return;
    const { data, error: addError } = await db
      .from('meta_questions')
      .insert({
        user_id: $session.user.id,
        list_name: selectedList,
        question: newQuestionText.trim(),
        order_index: questions.length
      })
      .select()
      .single();
    if (addError) {
      console.error('Error adding question:', addError);
    } else {
      questions = [...questions, data as MetaQuestion];
      newQuestionText = '';
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    const { error: deleteError } = await db
      .from('meta_questions')
      .delete()
      .eq('id', id);
    if (deleteError) {
      console.error('Error deleting question:', deleteError);
    } else {
      questions = questions.filter(q => q.id !== id);
    }
  }

  async function updateQuestion(id: string, newText: string) {
    const { data, error: updateError } = await db
      .from('meta_questions')
      .update({ question: newText })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      console.error('Error updating question:', updateError);
    } else {
      questions = questions.map(q => (q.id === id ? (data as MetaQuestion) : q));
    }
  }
</script>

<svelte:head>
  <title>Meta Questions - Investment Analysis Platform</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">Meta Questions</h1>
    <div class="mb-6">
      <label for="selectList" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Select List
      </label>
      <select
        id="selectList"
        bind:value={selectedList}
        class="block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
      >
        {#each lists as list}
          <option value={list}>{list}</option>
        {/each}
      </select>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Questions for {selectedList}
      </h2>
      {#if loading}
        <div class="flex justify-center">
          <svg
            class="animate-spin h-8 w-8 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      {:else}
        <div class="space-y-4">
          {#each questions as question, index (question.id)}
            <div class="flex items-center">
              <input
                type="text"
                bind:value={question.question}
                on:blur={() => updateQuestion(question.id, question.question)}
                class="flex-grow rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 mr-2"
                placeholder="Enter your question"
              />
              <button
                on:click={() => deleteQuestion(question.id)}
                class="rounded-md bg-red-500 text-white px-3 py-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Delete question"
              >
                Delete
              </button>
            </div>
          {/each}
          <div class="flex items-center">
            <input
              type="text"
              placeholder="Add a new question"
              bind:value={newQuestionText}
              class="flex-grow rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 mr-2"
            />
            <button
              on:click={addQuestion}
              class="rounded-md bg-green-500 text-white px-3 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Add question"
            >
              Add
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
