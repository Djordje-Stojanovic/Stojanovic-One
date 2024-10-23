import * as pdfjsLib from 'pdfjs-dist';
import { browser } from '$app/environment';
import type { PDFPageProxy } from 'pdfjs-dist';

let workerSrc: string;
let pdfjsWorker: Worker | null = null;

if (browser) {
    workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    pdfjsWorker = new Worker(workerSrc);
}

export async function loadPdfDocument(pdfUrl: string) {
    if (!browser) return null;

    try {
        const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            withCredentials: false,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true
        });

        return await loadingTask.promise;
    } catch (err) {
        console.error('Error loading PDF:', err);
        throw new Error('Failed to load PDF. Please try again.');
    }
}

export async function renderPdfPage(page: PDFPageProxy, canvas: HTMLCanvasElement, scale: number) {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Failed to get canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
        enableWebGL: true
    };

    await page.render(renderContext).promise;
}

export function cleanupPdfWorker() {
    if (pdfjsWorker) {
        pdfjsWorker.terminate();
        pdfjsWorker = null;
    }
}
