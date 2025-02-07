<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let selectedModel = 'amazon/nova-lite-v1';
    export let selectedApi = 'openrouter';

    const dispatch = createEventDispatcher();

    const openrouterModels = [
        {
            name: 'Amazon: Nova Lite 1.0',
            id: 'amazon/nova-lite-v1',
            description: 'Low-cost multimodal model for text and images'
        },
        {
            name: 'DeepSeek: R1 Distill Qwen 32B',
            id: 'deepseek/deepseek-r1-distill-qwen-32b',
            description: 'Distilled 32B model outperforming OpenAI o1-mini across benchmarks'
        },
        {
            name: 'Google: Gemini Flash 2.0',
            id: 'google/gemini-2.0-flash-001',
            description: 'Fast TTFT with quality on par with larger models'
        }
    ];

    const geminiModels = [
        {
            name: 'Gemini 2.0 Pro',
            id: 'gemini-2.0-pro-exp-02-05',
            description: 'Improved quality, especially for world knowledge, code, and long context'
        },
        {
            name: 'Gemini 2.0 Flash Thinking',
            id: 'gemini-2.0-flash-thinking-exp-01-21',
            description: 'Reasoning for complex problems, features new thinking capabilities'
        }
    ];

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedModel = select.value;
        dispatch('change', { model: select.value, api: selectedApi });
    }

    function toggleApi() {
        selectedApi = selectedApi === 'openrouter' ? 'gemini' : 'openrouter';
        // Reset selected model to first one in the list when switching APIs
        selectedModel = selectedApi === 'openrouter' ? openrouterModels[0].id : geminiModels[0].id;
        dispatch('change', { model: selectedModel, api: selectedApi });
    }

    $: models = selectedApi === 'openrouter' ? openrouterModels : geminiModels;
</script>

<div class="flex gap-2 items-center">
    <button 
        on:click={toggleApi}
        class="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out
        {selectedApi === 'openrouter' 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-blue-600 text-white hover:bg-blue-700'}"
    >
        {selectedApi === 'openrouter' ? 'OpenRouter' : 'Gemini'}
    </button>

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
</div>
