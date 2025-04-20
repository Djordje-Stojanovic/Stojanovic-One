<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let stockItem: any;

    const dispatch = createEventDispatcher();

    const dueDiligenceSections = [
        { title: "Business Description", questions: ["Describe the business model", "What products or services does the company offer?"] },
        { title: "Business History", questions: ["When was the company founded?", "What are the key milestones in the company's history?"] },
        { title: "Business Quality", questions: ["What are the company's competitive advantages?", "How stable are the company's revenues and earnings?"] },
        { title: "Business Moat", questions: ["Does the company have a strong brand?", "Are there high switching costs for customers?"] },
        { title: "Business Growth", questions: ["What is the company's historical growth rate?", "What are the future growth prospects?"] },
        { title: "Business Competitors", questions: ["Who are the main competitors?", "How does the company compare to its competitors?"] },
        { title: "Business Valuation", questions: ["What is the current P/E ratio?", "How does the valuation compare to industry peers?"] }
    ];

    function updateAnswer(sectionIndex: number, questionIndex: number, answer: boolean) {
        const globalQuestionIndex = sectionIndex * 2 + questionIndex;
        const updatedAnswer = {
            id: stockItem.answers?.find(a => a.question_index === globalQuestionIndex)?.id,
            section_index: sectionIndex,
            question_index: globalQuestionIndex,
            answer,
            stock_item_id: stockItem.id
        };
        dispatch('updateAnswer', updatedAnswer);
    }
</script>

<div class="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Due Diligence Analysis</h2>
    
    {#each dueDiligenceSections as section, sectionIndex}
        <div class="mb-6">
            <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{section.title}</h3>
            {#each section.questions as question, questionIndex}
                <div class="mb-4">
                    <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            class="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={stockItem.answers?.find(a => a.question_index === (sectionIndex * 2 + questionIndex))?.answer ?? false}
                            on:change={(e) => updateAnswer(sectionIndex, questionIndex, e.currentTarget.checked)}
                        />
                        {question}
                    </label>
                </div>
            {/each}
        </div>
    {/each}
</div>