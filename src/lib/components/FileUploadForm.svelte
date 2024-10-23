<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import { session } from '$lib/stores/sessionStore';
    import { fileUploadStore } from '$lib/stores/fileUploadStore';
    import { createEventDispatcher } from 'svelte';

    export let symbol: string;
    const dispatch = createEventDispatcher();

    let file: File | null = null;
    let uploading = false;

    const allowedFileTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.google-apps.document',
        'application/vnd.google-apps.spreadsheet'
    ];

    function validateFileType(file: File): boolean {
        return allowedFileTypes.includes(file.type);
    }

    async function uploadFile() {
        if (!file) return;

        if (!validateFileType(file)) {
            fileUploadStore.setError('Invalid file type. Please upload a PDF, TXT, Word, Excel, or Google Docs file.');
            return;
        }

        uploading = true;
        fileUploadStore.setError('');

        if (!$session?.user) {
            fileUploadStore.setError('You must be logged in to upload files.');
            uploading = false;
            return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${symbol}/${fileName}`;

        try {
            const { error: uploadError, data } = await supabase.storage
                .from('company-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('company-documents')
                .getPublicUrl(filePath);

            const { error: dbError, data: fileData } = await supabase
                .from('company_files')
                .insert({
                    symbol,
                    file_path: filePath,
                    file_name: file.name,
                    user_id: $session.user.id,
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // Update the store with the new file
            if (fileData) {
                fileUploadStore.addFile(fileData);
            }

            dispatch('fileUploaded', { url: urlData.publicUrl });
            file = null;
            
            // Reset file input
            if (document.querySelector('input[type="file"]')) {
                (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
            }
        } catch (err: unknown) {
            console.error('Upload error:', err);
            fileUploadStore.setError(err instanceof Error ? err.message : 'An error occurred during upload.');
        } finally {
            uploading = false;
        }
    }

    function handleFileChange(event: Event) {
        const target = event.currentTarget as HTMLInputElement;
        file = target.files ? target.files[0] : null;
    }
</script>

<div class="mb-4">
    <input
        type="file"
        accept=".pdf,.txt,.docx,.xlsx,.gdoc,.gsheet"
        on:change={handleFileChange}
        class="mb-4 p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
    />
    {#if file}
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Selected file: {file.name}</p>
        <button
            on:click={uploadFile}
            disabled={uploading}
            class="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
            {uploading ? 'Uploading...' : 'Upload'}
        </button>
    {/if}
</div>
