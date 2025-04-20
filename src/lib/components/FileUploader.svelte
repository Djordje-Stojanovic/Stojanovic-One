<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import { fileUploadStore } from '$lib/stores/fileUploadStore';
    import FileUploadForm from './FileUploadForm.svelte';
    import FileList from './FileList.svelte';
    import PdfViewer from './PdfViewer.svelte';

    export let symbol: string;
    let pdfUrl: string | null = null;

    async function handleViewPdf(event: CustomEvent) {
        const fileId = event.detail.fileId;
        const file = $fileUploadStore.uploadedFiles.find(f => f.id === fileId);
        if (file) {
            try {
                const { data } = supabase.storage
                    .from('company-documents')
                    .getPublicUrl(file.file_path);

                if (!data.publicUrl) throw new Error('Failed to get public URL');
                
                const response = await fetch(data.publicUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const blob = await response.blob();
                if (blob.size === 0) {
                    throw new Error('Received empty PDF file');
                }

                if (pdfUrl && pdfUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(pdfUrl);
                }
                
                pdfUrl = URL.createObjectURL(blob);
            } catch (err) {
                console.error('Error getting PDF URL:', err);
                fileUploadStore.setError('Failed to load PDF. Please try again.');
            }
        }
    }

    function handleFileUploaded() {
        // Refresh the file list by dispatching a custom event
        const event = new CustomEvent('refreshList');
        document.dispatchEvent(event);
    }

    function closePdfViewer() {
        if (pdfUrl && pdfUrl.startsWith('blob:')) {
            URL.revokeObjectURL(pdfUrl);
        }
        pdfUrl = null;
    }
</script>

<div class="my-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upload Documents</h3>
    
    <FileUploadForm {symbol} on:fileUploaded={handleFileUploaded} />
    
    {#if $fileUploadStore.error}
        <div class="text-red-500 mb-4">{$fileUploadStore.error}</div>
    {/if}

    <FileList {symbol} on:viewPdf={handleViewPdf} />

    {#if pdfUrl}
        <PdfViewer 
            pdfUrl={pdfUrl} 
            on:close={closePdfViewer}
            on:error={(e) => fileUploadStore.setError(e.detail.message)}
        />
    {/if}
</div>
