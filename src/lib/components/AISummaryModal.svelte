<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let loading = false;
    export let summary: string | null = null;
    export let selectedModel: string;
    
    const dispatch = createEventDispatcher();
    
    function handleClose() {
        dispatch('close');
    }
</script>

{#if loading || summary}
    <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div class="p-6 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">AI Company Summary</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Using {selectedModel.split('/')[1]}</p>
                </div>
                <button 
                    on:click={handleClose}
                    class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="px-6 pb-6 overflow-y-auto flex-grow">
                {#if loading}
                    <div class="flex flex-col items-center justify-center space-y-4 py-8">
                        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p class="text-gray-600 dark:text-gray-300">Generating AI Summary...</p>
                    </div>
                {:else if summary}
                    <div class="prose dark:prose-invert max-w-none">
                        {#each summary.split('\n') as line}
                            {#if line.startsWith('**') && line.endsWith('**')}
                                <h3 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mt-10 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    {line.replace(/\*\*/g, '')}
                                </h3>
                            {:else if line.trim().startsWith('* **')}
                                <h4 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-8 mb-4 flex items-center">
                                    <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                    {line.replace(/\* \*\*/g, '').replace(/\*\*/g, '')}
                                </h4>
                            {:else if line.trim().startsWith('+')}
                                <p class="mb-3 ml-6 text-gray-700 dark:text-gray-300 flex items-start">
                                    <span class="mr-3 text-blue-500">•</span>
                                    <span class="flex-1">{line.replace('+', '').trim()}</span>
                                </p>
                            {:else if line.trim()}
                                <p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {line}
                                </p>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
