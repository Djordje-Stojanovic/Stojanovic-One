<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let selectedModel = 'anthropic/claude-3.7-sonnet';

    const dispatch = createEventDispatcher();

    const models = [
        {
            name: 'Claude 3.7 Sonnet',
            id: 'anthropic/claude-3.7-sonnet',
            description: 'Advanced LLM with improved reasoning, coding, and problem-solving capabilities'
        },
        {
            name: 'DeepSeek R1',
            id: 'deepseek/deepseek-r1',
            description: 'Performance on par with OpenAI o1, but open-sourced with fully open reasoning tokens. MIT licensed.'
        },
        {
            name: 'Gemini 2.0 Flash Thinking',
            id: 'google/gemini-2.0-flash-thinking-exp:free',
            description: 'Reasoning for complex problems, features new thinking capabilities'
        }
    ];

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedModel = select.value;
        dispatch('change', { model: select.value });
    }
</script>

<div class="relative w-full">
    <select
        bind:value={selectedModel}
        on:change={handleChange}
        class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
        aria-label="Select AI model"
    >
        {#each models as model}
            <option value={model.id} title={model.description}>
                {model.name}
            </option>
        {/each}
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
    </div>
</div>
