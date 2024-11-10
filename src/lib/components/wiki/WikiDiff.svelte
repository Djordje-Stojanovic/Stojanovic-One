<script lang="ts">
    import { diffLines } from 'diff';

    export let oldContent: string;
    export let newContent: string;

    $: differences = diffLines(oldContent || '', newContent || '');

    function stripHtmlTags(str: string) {
        return str.replace(/<[^>]*>/g, '');
    }

    function getLineClass(line: { added?: boolean; removed?: boolean }) {
        if (line.added) return 'bg-green-100 dark:bg-green-900';
        if (line.removed) return 'bg-red-100 dark:bg-red-900';
        return 'bg-gray-50 dark:bg-gray-800';
    }

    function getLinePrefix(line: { added?: boolean; removed?: boolean }) {
        if (line.added) return '+';
        if (line.removed) return '-';
        return ' ';
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
                    {stripHtmlTags(line.value)}
                </div>
            </div>
        {/each}
    </div>
</div>
