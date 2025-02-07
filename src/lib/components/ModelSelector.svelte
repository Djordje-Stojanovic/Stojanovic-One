<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let selectedModel = 'meta-llama/llama-3.2-3b-instruct';

    const dispatch = createEventDispatcher();

    const models = [
        {
            name: 'Meta: Llama 3.2 3B Instruct',
            id: 'meta-llama/llama-3.2-3b-instruct',
            description: 'Optimized for advanced NLP tasks, supports 8 languages'
        },
        {
            name: 'Meta: Llama 3.1 8B Instruct',
            id: 'meta-llama/llama-3.1-8b-instruct',
            description: 'Fast and efficient 8B parameter model'
        },
        {
            name: 'Amazon: Nova Micro 1.0',
            id: 'amazon/nova-micro-v1',
            description: 'Low latency, optimized for speed and cost'
        },
        {
            name: 'Amazon: Nova Lite 1.0',
            id: 'amazon/nova-lite-v1',
            description: 'Low-cost multimodal model for text and images'
        },
        {
            name: 'Google: Gemini Flash 2.0',
            id: 'google/gemini-2.0-flash-001',
            description: 'Fast TTFT with quality on par with larger models'
        }
    ];

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedModel = select.value;
        dispatch('change', select.value);
    }
</script>

<div class="relative flex-1">
    <select
        bind:value={selectedModel}
        on:change={handleChange}
        class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
