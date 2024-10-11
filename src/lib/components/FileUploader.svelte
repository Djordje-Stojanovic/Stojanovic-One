<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { createEventDispatcher } from 'svelte';

	export let symbol: string;
	const dispatch = createEventDispatcher();

	let file: File | null = null;
	let uploading = false;
	let error = '';

	async function uploadFile() {
		if (!file) return;

		uploading = true;
		error = '';

		if (!$session) {
			error = 'You must be logged in to upload files.';
			uploading = false;
			return;
		}

		const user = $session.user;
		if (!user) {
			error = 'User information is missing. Please try logging in again.';
			uploading = false;
			return;
		}

		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}.${fileExt}`;
		const filePath = `${symbol}/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from('company-documents')
			.upload(filePath, file);

		if (uploadError) {
			error = uploadError.message;
		} else {
			const { data: urlData } = await supabase.storage
				.from('company-documents')
				.getPublicUrl(filePath);

			// Save file metadata
			const { error: dbError } = await supabase.from('company_files').insert({
				symbol,
				file_path: filePath,
				user_id: user.id,
			});

			if (dbError) {
				error = dbError.message;
			} else {
				dispatch('fileUploaded', { url: urlData.publicUrl });
			}
		}

		uploading = false;
		file = null;
	}
</script>

<div class="my-4">
	<h3 class="text-lg font-semibold">Upload Documents</h3>
	<input type="file" on:change={(e) => {
		const target = e.currentTarget;
		file = target.files ? target.files[0] : null;
	}} />
	{#if file}
		<p>Selected file: {file.name}</p>
		<button
			on:click={uploadFile}
			disabled={uploading}
			class="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
		>
			{uploading ? 'Uploading...' : 'Upload'}
		</button>
	{/if}
	{#if error}
		<div class="text-red-500">{error}</div>
	{/if}
</div>
