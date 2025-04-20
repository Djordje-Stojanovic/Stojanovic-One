<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';

  export let questions: Question[] = [];
  export let answers: { [key: string]: AnswerData } = {};
  export let updateAnswer: (questionId: string, answer: boolean, textAnswer: string) => void;
  export let saveStatus: { [key: string]: 'saving' | 'saved' | 'error' | '' } = {};

  interface Question {
    id: string;
    question: string;
  }

  interface AnswerData {
    answer: boolean;
    text_answer?: string;
  }

  function handleAnswerChange(questionId: string, answerValue: boolean) {
    const currentText = answers[questionId]?.text_answer || '';
    updateAnswer(questionId, answerValue, currentText);
  }

  function handleTextInput(questionId: string, event: Event) {
    const textValue = (event.target as HTMLTextAreaElement).value;
    const currentAnswer = answers[questionId]?.answer ?? false;
    updateAnswer(questionId, currentAnswer, textValue);
  }

  function getStatusMessage(questionId: string) {
    const status = saveStatus[questionId];
    if (status === 'saving') return 'Saving...';
    if (status === 'saved') return 'Saved';
    if (status === 'error') return 'Error saving';
    return '';
  }
</script>

<style>
  .question-item {
    background-color: var(--bg-secondary);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    font-weight: 500;
  }
  .checkbox-label input {
    margin-right: 0.5rem;
  }
  .text-area {
    margin-top: 0.5rem;
    width: 100%;
    resize: vertical;
    background-color: var(--bg-input);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 0.5rem;
  }
  .text-area:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
  .save-status {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 9999px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
  }
  .save-status.saving { 
    color: var(--color-warning);
    background-color: var(--bg-warning);
  }
  .save-status.saved { 
    color: var(--color-success);
    background-color: var(--bg-success);
  }
  .save-status.error { 
    color: var(--color-error);
    background-color: var(--bg-error);
  }
  .save-status-icon {
    margin-right: 4px;
  }
</style>

<div class="question-list">
  <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Questions</h2>

  {#if questions.length > 0}
    {#each questions as question}
      <div class="question-item">
        <label class="checkbox-label text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            checked={answers[question.id]?.answer ?? false}
            on:change={(e) => handleAnswerChange(question.id, e.currentTarget.checked)}
          />
          {question.question}
          {#if saveStatus[question.id]}
            <span class="save-status {saveStatus[question.id]}" transition:fade={{ duration: 200 }}>
              <span class="save-status-icon">
                {#if saveStatus[question.id] === 'saving'}
                  ⏳
                {:else if saveStatus[question.id] === 'saved'}
                  ✓
                {:else if saveStatus[question.id] === 'error'}
                  ❌
                {/if}
              </span>
              {getStatusMessage(question.id)}
            </span>
          {/if}
        </label>
        <textarea
          class="text-area"
          placeholder="Add your notes here..."
          value={answers[question.id]?.text_answer ?? ''}
          on:input={(e) => handleTextInput(question.id, e)}
        ></textarea>
      </div>
    {/each}
  {:else}
    <p class="text-gray-600 dark:text-gray-300">No questions available for this list.</p>
  {/if}
</div>