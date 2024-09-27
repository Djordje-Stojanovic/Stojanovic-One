<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let stockItem: any;

    const dispatch = createEventDispatcher();

    const tooExpensiveQuestions = [
        "Does the buy ready price realistically offer a margin of safety?",
        "Does it offer a realistic 15%+ annual return opportunity?",
        "Is the company's competitive advantage likely to strengthen over time?",
        "Are there any potential catalysts that could bring the price down to the buy ready price?"
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

    function updatePrice(field: 'current_price' | 'buy_ready_price', value: number) {
        dispatch('updatePrice', { field, value, date: new Date().toISOString() });
    }
</script>

<div class="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Too Expensive Analysis</h2>
    
    <div class="mb-6 grid grid-cols-2 gap-4">
        <div>
            <label for="current_price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Price ($)</label>
            <input
                type="number"
                id="current_price"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
                value={stockItem.current_price}
                on:input={(e) => {
                    const target = e.currentTarget;
                    if (target instanceof HTMLInputElement && target.value) {
                        updatePrice('current_price', parseFloat(target.value));
                    }
                }}
            />
            <p class="mt-1 text-sm text-gray-500">Last updated: {new Date(stockItem.current_price_date).toLocaleString()}</p>
        </div>
        <div>
            <label for="buy_ready_price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Buy Ready Price ($)</label>
            <input
                type="number"
                id="buy_ready_price"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
                value={stockItem.buy_ready_price}
                on:input={(e) => {
                    const target = e.currentTarget;
                    if (target instanceof HTMLInputElement && target.value) {
                        updatePrice('buy_ready_price', parseFloat(target.value));
                    }
                }}
            />
            <p class="mt-1 text-sm text-gray-500">Last updated: {new Date(stockItem.buy_ready_price_date).toLocaleString()}</p>
        </div>
    </div>
    
    {#each tooExpensiveQuestions as question, index}
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