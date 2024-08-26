<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { session } from '$lib/stores/sessionStore';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	$: if (browser && !$session) {
		goto('/login');
	}

	let username = '';
	let website = '';
	let avatarUrl = '';

	onMount(async () => {
		const { data, error } = await supabase
			.from('profiles')
			.select('username, website, avatar_url')
			.eq('id', $session?.user.id)
			.single();

		if (error && error.code !== 'PGRST116') {
			console.error('Error fetching profile:', error);
		} else if (data) {
			username = data.username;
			website = data.website;
			avatarUrl = data.avatar_url;
		} else {
			// Profile doesn't exist, create a new one
			const { error: insertError } = await supabase
				.from('profiles')
				.insert({ id: $session?.user.id });
			if (insertError) {
				console.error('Error creating profile:', insertError);
			}
		}
	});

	async function updateProfile() {
		const { data, error } = await supabase.from('profiles').upsert(
			{
				id: $session?.user.id,
				username,
				website,
				avatar_url: avatarUrl,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'id' }
		);

		if (error) {
			console.error('Error updating profile:', error);
			alert('Failed to update profile. Please try again.');
		} else {
			alert('Profile updated successfully!');
		}
	}
</script>

<div class="mx-auto mt-10 max-w-md">
	<h1 class="mb-5 text-2xl font-bold dark:text-white">User Profile</h1>
	<form on:submit|preventDefault={updateProfile} class="space-y-4">
		<div>
			<label for="username" class="mb-1 block dark:text-gray-300">Username</label>
			<input
				id="username"
				bind:value={username}
				class="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
			/>
		</div>
		<div>
			<label for="website" class="mb-1 block dark:text-gray-300">Website</label>
			<input
				id="website"
				bind:value={website}
				class="w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
			/>
		</div>
		<button
			type="submit"
			class="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
		>
			Update Profile
		</button>
	</form>
</div>
