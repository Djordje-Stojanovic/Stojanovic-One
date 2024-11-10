<script lang="ts">
    import { diffLines } from '$lib/utils/diffUtils';
    import type { DiffLine } from '$lib/utils/diffUtils';

    export let oldContent: string;
    export let newContent: string;

    $: differences = diffLines(oldContent || '', newContent || '');

    function getLineClass(line: DiffLine) {
        if (line.added) return 'bg-green-100 dark:bg-green-900';
        if (line.removed) return 'bg-red-100 dark:bg-red-900';
        return 'bg-gray-50 dark:bg-gray-800';
    }

    function getLinePrefix(line: DiffLine) {
        if (line.added) return '+';
        if (line.removed) return '-';
        return ' ';
    }

    function renderContent(line: DiffLine) {
        if (line.type === 'image' && line.imageData) {
            return `<img src="${line.imageData}" alt="Wiki content image" class="max-w-full h-auto my-2" />`;
        }
        return line.value;
    }
</script>

<div class="font-mono text-sm overflow-x-auto">
    <div class="border dark:border-gray-700 rounded-lg">
        {#each differences as line}
            <div class="flex {getLineClass(line)} border-b dark:border-gray-700 last:border-b-0">
                <div class="px-2 py-1 border-r dark:border-gray-700 text-gray-500 select-none w-8 text-center">
                    {getLinePrefix(line)}
                </div>
                <div class="px-4 py-1 whitespace-pre-wrap break-all">
                    {@html renderContent(line)}
                </div>
            </div>
        {/each}
    </div>
</div>
