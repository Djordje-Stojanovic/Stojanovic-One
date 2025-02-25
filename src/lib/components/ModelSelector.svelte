<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let selectedModel = 'amazon/nova-lite-v1';

    const dispatch = createEventDispatcher();

    const models = [
        {
            name: 'Amazon Nova Lite',
            id: 'amazon/nova-lite-v1',
            description: 'Low-cost multimodal model for text and images'
        },
        {
            name: 'DeepSeek R1 Distill',
            id: 'deepseek/deepseek-r1-distill-qwen-32b',
            description: 'Distilled 32B model outperforming OpenAI o1-mini across benchmarks'
        },
        {
            name: 'Gemini Flash 2.0',
            id: 'google/gemini-2.0-flash-001',
            description: 'Fast TTFT with quality on par with larger models'
        },
        {
            name: 'Gemini 2.0 Pro',
            id: 'google/gemini-2.0-pro-exp-02-05:free',
            description: 'Improved quality, especially for world knowledge, code, and long context'
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
