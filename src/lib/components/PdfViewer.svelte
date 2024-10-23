<script lang="ts">
    import { onDestroy, createEventDispatcher } from 'svelte';
    import { loadPdfDocument, renderPdfPage, cleanupPdfWorker } from '$lib/utils/pdfViewerUtils';
    import type { PDFDocumentProxy } from 'pdfjs-dist';

    const dispatch = createEventDispatcher();

    export let pdfUrl: string;

    let pdfDoc: PDFDocumentProxy | null = null;
    let pdfPageNum = 1;
    let pdfNumPages = 0;
    let currentScale = 1.0;

    async function loadPdf() {
        try {
            pdfDoc = await loadPdfDocument(pdfUrl);
            if (pdfDoc) {
                pdfNumPages = pdfDoc.numPages;
                pdfPageNum = 1;
                await renderPage(pdfPageNum);
            }
        } catch (err) {
            console.error('Error loading PDF:', err);
            dispatch('error', { message: 'Failed to load PDF. Please try again.' });
        }
    }

    async function renderPage(num: number) {
        if (!pdfDoc) return;

        try {
            const page = await pdfDoc.getPage(num);
            const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
            await renderPdfPage(page, canvas, currentScale);
        } catch (err) {
            console.error('Error rendering page:', err);
            dispatch('error', { message: 'Failed to render PDF page.' });
        }
    }

    function adjustScale(factor: number) {
        currentScale = Math.max(0.25, Math.min(3.0, currentScale * factor));
        renderPage(pdfPageNum);
    }

    function changePage(offset: number) {
        pdfPageNum = Math.min(Math.max(pdfPageNum + offset, 1), pdfNumPages);
        renderPage(pdfPageNum);
    }

    onDestroy(() => {
        cleanupPdfWorker();
        if (pdfUrl && pdfUrl.startsWith('blob:')) {
            URL.revokeObjectURL(pdfUrl);
        }
    });

    $: {
        if (pdfUrl) {
            loadPdf();
        }
    }
</script>

<div class="mt-8">
    <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">PDF Viewer</h4>
        <div class="flex gap-2">
            <button
                on:click={() => adjustScale(1.2)}
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
                Zoom In
            </button>
            <button
                on:click={() => adjustScale(0.8)}
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
                Zoom Out
            </button>
            <button
                on:click={() => dispatch('close')}
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Close
            </button>
        </div>
    </div>
    <div class="bg-white p-4 rounded-lg shadow overflow-auto max-h-[800px]">
        <div class="flex justify-center">
            <canvas id="pdf-canvas" class="max-w-full"></canvas>
        </div>
        <div class="mt-4 flex justify-between items-center">
            <button
                on:click={() => changePage(-1)}
                disabled={pdfPageNum <= 1}
                class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
            >
                Previous
            </button>
            <span>Page {pdfPageNum} of {pdfNumPages}</span>
            <button
                on:click={() => changePage(1)}
                disabled={pdfPageNum >= pdfNumPages}
                class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
            >
                Next
            </button>
        </div>
    </div>
</div>
