<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { compressImage } from '$lib/utils/imageCompression';
	import ErrorMessage from './ErrorMessage.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let file: File | null = null;
	let name = '';
	let category = '';
	let errorMessage = '';
	let isUploading = false;

	const categories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!$session) {
			errorMessage = 'You must be logged in to upload items.';
			return;
		}

		if (!file || !name || !category) {
			errorMessage = 'Please fill in all fields and select an image.';
			return;
		}

		isUploading = true;
		errorMessage = '';

		try {
			const compressedFile = await compressImage(file);
			const fileName = `${Date.now()}_${file.name}`;
			const filePath = `${$session.user.id}/${fileName}`;
			const { data, error } = await supabase.storage
				.from('clothing-items')
				.upload(filePath, compressedFile);

			if (error) throw error;

			const { data: publicUrlData, error: publicUrlError } = supabase.storage
				.from('clothing-items')
				.getPublicUrl(data.path);

			if (publicUrlError) throw publicUrlError;

			const { data: insertData, error: insertError } = await supabase
				.from('clothing_items')
				.insert({
					user_id: $session.user.id,
					name,
					category,
					image_path: data.path,
					public_url: publicUrlData.publicUrl
				});

			if (insertError) throw insertError;

			file = null;
			name = '';
			category = '';
			dispatch('itemUploaded');
		} catch (error) {
			console.error('Error uploading item:', error);
			if (error instanceof Error) {
				errorMessage = `Failed to upload item: ${error.message}`;
			} else {
				errorMessage = 'Failed to upload item. Please try again.';
			}
		} finally {
			isUploading = false;
		}
	}
</script>

<form
	on:submit={handleSubmit}
	class="space-y-6 rounded-lg bg-white p-6 shadow-md dark:bg-secondary-700"
>
	<div>
		<label
			for="name"
			class="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-100"
			>Item Name</label
		>
		<input
			type="text"
			id="name"
			bind:value={name}
			class="input-field w-full bg-secondary-100 dark:bg-secondary-600"
			required
		/>
	</div>

	<div>
		<label
			for="category"
			class="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-100"
			>Category</label
		>
		<select
			id="category"
			bind:value={category}
			class="input-field w-full bg-secondary-100 dark:bg-secondary-600"
			required
		>
			<option value="">Select a category</option>
			{#each categories as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>
	</div>

	<div>
		<label
			for="image"
			class="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-100">Image</label
		>
		<input
			type="file"
			id="image"
			accept="image/*"
			on:change={(e) => (file = e.target.files[0])}
			class="input-field w-full bg-secondary-100 dark:bg-secondary-600"
			required
		/>
	</div>

	{#if file}
		<p class="text-sm text-secondary-700 dark:text-secondary-300">Selected file: {file.name}</p>
	{/if}

	{#if errorMessage}
		<ErrorMessage message={errorMessage} />
	{/if}

	<button
		type="submit"
		class="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-offset-secondary-800"
		disabled={isUploading}
	>
		{isUploading ? 'Uploading...' : 'Upload Item'}
	</button>
</form>
