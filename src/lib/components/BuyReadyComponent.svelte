<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let stockItem: any;

    const dispatch = createEventDispatcher();

    const buyReadyQuestions = [
        "Was all due diligence carefully addressed?",
        "Does it align with our diversification and concentration policies inside my portfolio?",
        "Do I want to hold it for 10+ Years?",
        "Is the current price below the maximum buy price?"
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

    function updatePrice(field: 'current_price' | 'max_buy_price', value: number) {
        dispatch('updatePrice', { field, value, date: new Date().toISOString() });
    }
</script>

<div class="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Buy Ready Analysis</h2>
    
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
            <label for="max_buy_price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Buy Price ($)</label>
            <input
                type="number"
                id="max_buy_price"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-100"
                value={stockItem.max_buy_price}
                on:input={(e) => {
                    const target = e.currentTarget;
                    if (target instanceof HTMLInputElement && target.value) {
                        updatePrice('max_buy_price', parseFloat(target.value));
                    }
                }}
            />
            <p class="mt-1 text-sm text-gray-500">Last updated: {new Date(stockItem.max_buy_price_date).toLocaleString()}</p>
        </div>
    </div>
    
    {#each buyReadyQuestions as question, index}
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