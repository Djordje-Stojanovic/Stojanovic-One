<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { session } from '$lib/stores/sessionStore';
  import { onMount } from 'svelte';
  import { writable, type Writable } from 'svelte/store';

  export let stockItem: any;
  export let questions: any[] = [];

  interface AnswerData {
    answer: boolean;
    text_answer?: string;
  }

  interface SaveStatus {
    [key: string]: 'saving' | 'saved' | 'error' | '';
  }

  interface AnswersStore {
    [key: string]: AnswerData;
  }

  const answers: Writable<AnswersStore> = writable({});
  const saveStatus: Writable<SaveStatus> = writable({});

  // Load initial answers on mount and when stockItem changes
  $: if (stockItem && stockItem.id) {
    loadAnswers();
  }

  async function loadAnswers() {
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('stock_answers')
        .select('*')
        .eq('user_id', $session?.user?.id)
        .eq('stock_item_id', stockItem.id)
        .eq('list_name', stockItem.list_name);

      if (answersError) throw answersError;

      // Map answers to a dictionary
      const answersMap = answersData.reduce((acc: { [key: string]: AnswerData }, answer) => {
        acc[answer.question_id] = {
          answer: answer.answer,
          text_answer: answer.text_answer || '',
        };
        return acc;
      }, {});

      answers.set(answersMap);
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  }

  async function updateAnswer(questionId: string, answerValue: boolean, textAnswer: string) {
    // Update local state immediately (optimistic update)
    answers.update((current: AnswersStore) => {
      current[questionId] = { answer: answerValue, text_answer: textAnswer };
      return current;
    });
    
    saveStatus.update((current: SaveStatus) => {
      current[questionId] = 'saving';
      return current;
    });

    try {
      const { error } = await supabase
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
        .single();

      if (error) throw error;

      saveStatus.update((current: SaveStatus) => {
        current[questionId] = 'saved';
        return current;
      });
      
      // Remove the save status after 5 seconds
      setTimeout(() => {
        saveStatus.update((current: SaveStatus) => {
          if (current[questionId] === 'saved') {
            delete current[questionId];
          }
          return current;
        });
      }, 5000);
    } catch (error) {
      console.error('Error updating answer:', error);
      saveStatus.update((current: SaveStatus) => {
        current[questionId] = 'error';
        return current;
      });

      // Revert local state on error
      loadAnswers();
    }
  }
</script>

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

<style lang="postcss">
  .question-item {
    @apply transition-all duration-300 ease-in-out;
  }
  .question-item:hover {
    @apply transform -translate-y-1;
  }
</style>
