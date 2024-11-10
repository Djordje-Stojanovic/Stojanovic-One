<script lang="ts">
    import Quill from 'quill';
    import type { QuillOptionsStatic } from 'quill';
    import { onMount } from 'svelte';

    export let content: string;
    export let onSave: (content: string) => void;
    export let onCancel: () => void;

    let quillEditor: Quill;
    let wordCount = 0;

    const quillOptions: QuillOptionsStatic = {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['blockquote', 'code-block'],
                ['clean']
            ],
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        theme: 'snow',
        placeholder: 'Type something...'
    };

    onMount(() => {
        const editorContainer = document.getElementById('quill-editor');
        if (editorContainer) {
            quillEditor = new Quill(editorContainer, quillOptions);
            quillEditor.root.innerHTML = content;
            quillEditor.on('text-change', updateWordCount);
            updateWordCount();
        }
    });

    function updateWordCount() {
        const text = quillEditor ? quillEditor.getText() : content.replace(/<[^>]*>/g, '');
        wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length;
    }

    function handleSave() {
        onSave(quillEditor.root.innerHTML);
    }
</script>

<style>
    :global(.ql-toolbar.ql-snow) {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        background-color: var(--bg-secondary, #f3f4f6);
        color: var(--text-primary, #111827);
        border-color: var(--border-color, #d1d5db);
    }
    :global(.ql-container.ql-snow) {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        min-height: 200px;
        background-color: var(--bg-primary, #ffffff);
        color: var(--text-primary, #111827);
        border-color: var(--border-color, #d1d5db);
    }
    :global(.ql-editor) {
        font-size: 16px;
        line-height: 1.5;
        padding: 1rem;
    }
    :global(.dark .ql-toolbar.ql-snow) {
        background-color: var(--bg-secondary, #374151);
        color: var(--text-primary, #f9fafb);
        border-color: var(--border-color, #4b5563);
    }
    :global(.dark .ql-container.ql-snow) {
        background-color: var(--bg-primary, #1f2937);
        color: var(--text-primary, #f9fafb);
        border-color: var(--border-color, #4b5563);
    }
    :global(.ql-snow .ql-stroke) {
        stroke: var(--text-primary, #111827);
    }
    :global(.dark .ql-snow .ql-stroke) {
        stroke: var(--text-primary, #f9fafb);
    }
    :global(.ql-snow .ql-fill) {
        fill: var(--text-primary, #111827);
    }
    :global(.dark .ql-snow .ql-fill) {
        fill: var(--text-primary, #f9fafb);
    }
</style>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
    <div id="quill-editor"></div>
</div>
<div class="flex justify-between items-center mb-4">
    <div>
        <button on:click={handleSave} class="mr-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-200">Save</button>
        <button on:click={onCancel} class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-200">Cancel</button>
    </div>
    <div class="text-sm text-gray-500">
        Word count: {wordCount}
    </div>
</div>
