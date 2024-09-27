<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { createEventDispatcher } from 'svelte';

	export let stockItemId: string;
	export let fileType: 'graph' | 'document' | 'note';

	const dispatch = createEventDispatcher();

	let file: File | null = null;
	let uploading = false;
	let error = '';

	async function uploadFile() {
		if (!file) return;

		uploading = true;
		error = '';

		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}.${fileExt}`;
		const filePath = `${$session.user.id}/${stockItemId}/${fileType}/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from('company-files')
			.upload(filePath, file);

		if (uploadError) {
			error = uploadError.message;
		} else {
			const { data: urlData, error: urlError } = await supabase.storage
				.from('company-files')
				.getPublicUrl(filePath);

			if (urlError) {
				error = urlError.message;
			} else {
				dispatch('fileUploaded', { type: fileType, url: urlData.publicUrl });
			}
		}

		uploading = false;
		file = null;
	}
</script>

<div class="mt-4">
	<input
		type="file"
		accept={fileType === 'graph' ? 'image/*' : fileType === 'document' ? '.pdf,.doc,.docx' : '.txt'}
		on:change={(e) => (file = e.target.files[0])}
	/>
	<button
		on:click={uploadFile}
		disabled={!file || uploading}
		class="mt-2 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
	>
		{uploading ? 'Uploading...' : 'Upload'}
	</button>
	{#if error}
		<p class="mt-2 text-red-600">{error}</p>
	{/if}
</div>
