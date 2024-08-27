<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { compressImage } from '$lib/utils/imageCompression';
	import ErrorMessage from './ErrorMessage.svelte';

	let file: File | null = null;
	let name = '';
	let category = '';
	let errorMessage = '';
	let isUploading = false;

	const categories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

	async function handleSubmit() {
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

			const { data: insertData, error: insertError } = await supabase
				.from('clothing_items')
				.insert({
					user_id: $session.user.id,
					name,
					category,
					image_path: data.path
				});

			if (insertError) throw insertError;

			file = null;
			name = '';
			category = '';
			alert('Item uploaded successfully!');
		} catch (error) {
			console.error('Error uploading item:', error);
			errorMessage = 'Failed to upload item. Please try again.';
		} finally {
			isUploading = false;
		}
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
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
			class="mb-1 block text-sm font-medium text-secondary-50 dark:text-secondary-100">Image</label
		>
		<div class="flex w-full items-center justify-center">
			<label
				for="image"
				class="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-secondary-300 bg-secondary-100 transition-colors duration-200 hover:bg-secondary-200 dark:border-secondary-500 dark:bg-secondary-600 dark:hover:bg-secondary-500"
			>
				<div class="flex flex-col items-center justify-center pb-6 pt-5">
					<svg
						class="mb-4 h-8 w-8 text-secondary-300 dark:text-secondary-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 16"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
						/>
					</svg>
					<p class="mb-2 text-sm text-secondary-300 dark:text-secondary-400">
						<span class="font-semibold">Click to upload</span> or drag and drop
					</p>
					<p class="text-xs text-secondary-300 dark:text-secondary-400">
						PNG, JPG or GIF (MAX. 800x400px)
					</p>
				</div>
				<input
					type="file"
					id="image"
					accept="image/*"
					on:change={(e) => (file = e.target.files[0])}
					class="hidden"
					required
				/>
			</label>
		</div>
	</div>

	{#if file}
		<p class="text-sm text-secondary-200 dark:text-secondary-300">Selected file: {file.name}</p>
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
