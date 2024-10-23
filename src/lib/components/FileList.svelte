<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import { fileUploadStore, type UploadedFile } from '$lib/stores/fileUploadStore';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let symbol: string;

    async function loadUploadedFiles() {
        try {
            const { data, error } = await supabase
                .from('company_files')
                .select('*')
                .eq('symbol', symbol);

            if (error) throw error;
            fileUploadStore.setUploadedFiles(data || []);
        } catch (err) {
            console.error('Error loading files:', err);
            fileUploadStore.setError('Failed to load files. Please refresh the page.');
        }
    }

    async function deleteSelectedFiles() {
        try {
            const selectedFiles = $fileUploadStore.selectedFiles;
            for (const fileId of selectedFiles) {
                const fileToDelete = $fileUploadStore.uploadedFiles.find(f => f.id === fileId);
                if (fileToDelete) {
                    const { error: storageError } = await supabase.storage
                        .from('company-documents')
                        .remove([fileToDelete.file_path]);

                    if (storageError) throw storageError;

                    const { error: dbError } = await supabase
                        .from('company_files')
                        .delete()
                        .eq('id', fileId);

                    if (dbError) throw dbError;
                }
            }
            await loadUploadedFiles();
            fileUploadStore.clearSelectedFiles();
        } catch (err) {
            console.error('Error deleting files:', err);
            fileUploadStore.setError('Failed to delete files. Please try again.');
        }
    }

    function viewPdf(fileId: string) {
        dispatch('viewPdf', { fileId });
    }

    $: {
        loadUploadedFiles();
    }
</script>

{#if $fileUploadStore.uploadedFiles.length > 0}
    <div class="mt-8">
        <h4 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Uploaded Files</h4>
        <div class="space-y-2">
            {#each $fileUploadStore.uploadedFiles as file (file.id)}
                <div class="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <input
                        type="checkbox"
                        id={file.id}
                        checked={$fileUploadStore.selectedFiles.includes(file.id)}
                        on:change={() => fileUploadStore.toggleFileSelection(file.id)}
                        class="mr-2"
                    />
                    <label for={file.id} class="flex-grow text-gray-800 dark:text-gray-200">{file.file_name}</label>
                    {#if file.file_name.toLowerCase().endsWith('.pdf')}
                        <button
                            on:click={() => viewPdf(file.id)}
                            class="ml-2 px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            View PDF
                        </button>
                    {/if}
                </div>
            {/each}
        </div>
        {#if $fileUploadStore.selectedFiles.length > 0}
            <button
                on:click={deleteSelectedFiles}
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
            >
                Delete Selected Files
            </button>
        {/if}
    </div>
{:else}
    <p class="text-gray-600 dark:text-gray-400">No files uploaded yet.</p>
{/if}
