<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import * as pdfjs from 'pdfjs-dist';
	import { getDocument } from 'pdfjs-dist';

	onMount(() => {
		if (browser) {
			// Use a dynamic import for the worker
			import('pdfjs-dist/build/pdf.worker.mjs').then(worker => {
				pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
			});
		}
	});

	export let symbol: string;
	const dispatch = createEventDispatcher();

	let file: File | null = null;
	let uploading = false;
	let error = '';
	let uploadedFiles: any[] = [];
	let selectedFiles: string[] = [];
	let pdfUrl: string | null = null;
	let pdfPageNum = 1;
	let pdfNumPages = 0;
	let pdfDoc: pdfjs.PDFDocumentProxy | null = null;

	const allowedFileTypes = [
		'application/pdf',
		'text/plain',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.google-apps.document',
		'application/vnd.google-apps.spreadsheet'
	];



	async function loadUploadedFiles() {
		const { data, error } = await supabase
			.from('company_files')
			.select('*')
			.eq('symbol', symbol);

		if (error) {
			console.error('Error loading files:', error);
		} else {
			uploadedFiles = data || [];
		}
	}

	function validateFileType(file: File): boolean {
		return allowedFileTypes.includes(file.type);
	}

	async function uploadFile() {
		if (!file) return;

		if (!validateFileType(file)) {
			error = 'Invalid file type. Please upload a PDF, TXT, Word, Excel, or Google Docs file.';
			return;
		}

		uploading = true;
		error = '';

		if (!$session?.user) {
			error = 'You must be logged in to upload files.';
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

			// Save file metadata
			const { error: dbError } = await supabase.from('company_files').insert({
				symbol,
				file_path: filePath,
				file_name: file.name,
				user_id: $session.user.id,
			});

			if (dbError) throw dbError;

			dispatch('fileUploaded', { url: urlData.publicUrl });
			file = null;
		} catch (err: unknown) {
			console.error('Upload error:', err);
			error = err instanceof Error ? err.message : 'An error occurred during upload.';
		} finally {
			uploading = false;
		}

		// After successful upload:
		await loadUploadedFiles();
	}

	async function deleteSelectedFiles() {
		try {
			for (const fileId of selectedFiles) {
				const fileToDelete = uploadedFiles.find(f => f.id === fileId);
				if (fileToDelete) {
					// Delete from storage
					const { error: storageError } = await supabase.storage
						.from('company-documents')
						.remove([fileToDelete.file_path]);

					if (storageError) throw storageError;

					// Delete from database
					const { error: dbError } = await supabase
						.from('company_files')
						.delete()
						.eq('id', fileId);

					if (dbError) throw dbError;
				}
			}
			await loadUploadedFiles();
			selectedFiles = [];
		} catch (err) {
			console.error('Error deleting files:', err);
			error = 'Failed to delete files. Please try again.';
		}
	}

	function handleFileSelection(fileId: string) {
		if (selectedFiles.includes(fileId)) {
			selectedFiles = selectedFiles.filter(id => id !== fileId);
		} else {
			selectedFiles = [...selectedFiles, fileId];
		}
	}

	function handleFileChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		file = target.files ? target.files[0] : null;
	}

	async function viewPdf(fileId: string) {
		const file = uploadedFiles.find(f => f.id === fileId);
		if (file) {
			const { data, error } = await supabase.storage
				.from('company-documents')
				.createSignedUrl(file.file_path, 60); // URL valid for 60 seconds

			if (error) {
				console.error('Error creating signed URL:', error);
				return;
			}

			pdfUrl = data.signedUrl;
			loadPdf();
		}
	}

	async function loadPdf() {
		if (!pdfUrl || !browser) return;

		try {
			const loadingTask = pdfjs.getDocument(pdfUrl);
			pdfDoc = await loadingTask.promise;
			pdfNumPages = pdfDoc.numPages;
			renderPage(pdfPageNum);
		} catch (err) {
			console.error('Error loading PDF:', err);
			error = 'Failed to load PDF. Please try again.';
		}
	}

	async function renderPage(num: number) {
		if (!pdfDoc) return;

		const page = await pdfDoc.getPage(num);
		const scale = 1.5;
		const viewport = page.getViewport({ scale });

		const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
		const context = canvas.getContext('2d');

		if (!context) {
			console.error('Failed to get canvas context');
			return;
		}

		canvas.height = viewport.height;
		canvas.width = viewport.width;

		const renderContext = {
			canvasContext: context,
			viewport: viewport
		};

		await page.render(renderContext);
	}

	function changePage(offset: number) {
		pdfPageNum = Math.min(Math.max(pdfPageNum + offset, 1), pdfNumPages);
		renderPage(pdfPageNum);
	}
</script>

<div class="my-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
	<h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upload Documents</h3>
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
	{#if error}
		<div class="text-red-500 mb-4">{error}</div>
	{/if}

	{#if uploadedFiles.length > 0}
		<div class="mt-8">
			<h4 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Uploaded Files</h4>
			<div class="space-y-2">
				{#each uploadedFiles as file (file.id)}
					<div class="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
						<input
							type="checkbox"
							id={file.id}
							checked={selectedFiles.includes(file.id)}
							on:change={() => handleFileSelection(file.id)}
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
			{#if selectedFiles.length > 0}
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

	{#if pdfUrl}
		<div class="mt-8">
			<h4 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">PDF Viewer</h4>
			<div class="bg-white p-4 rounded-lg shadow">
				<canvas id="pdf-canvas"></canvas>
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
	{/if}
</div>
