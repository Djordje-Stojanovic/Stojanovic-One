<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let stockItem: any;

    const dispatch = createEventDispatcher();

    const watchlistQuestions = [
        "What is the current market sentiment?",
        "Are there any upcoming catalysts?",
        "What is the current trading volume?",
        "Is there any recent news affecting the stock?"
    ];

    function updateAnswer(questionIndex: number, answer: boolean) {
        const updatedAnswer = {
            id: stockItem.answers?.find(a => a.question_index === questionIndex)?.id,
            question_index: questionIndex,
            answer,
            stock_item_id: stockItem.id
        };
        dispatch('updateAnswer', updatedAnswer);
    }
</script>

<div class="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Watchlist Analysis</h2>
    
    {#each watchlistQuestions as question, index}
        <div class="mb-4">
            <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={stockItem.answers?.find(a => a.question_index === index)?.answer ?? false}
                    on:change={(e) => updateAnswer(index, e.currentTarget.checked)}
                />
                {question}
            </label>
        </div>
    {/each}
</div>