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
	let email = '';
	let name = '';

	onMount(async () => {
		if ($session) {
			email = $session.user.email || '';
			name = $session.user.user_metadata.full_name || '';
			avatarUrl = $session.user.user_metadata.avatar_url || '';

			const { data, error } = await supabase
				.from('profiles')
				.select('username, website, avatar_url')
				.eq('id', $session.user.id)
				.single();

			if (error && error.code !== 'PGRST116') {
				console.error('Error fetching profile:', error);
			} else if (data) {
				username = data.username;
				website = data.website;
				avatarUrl = data.avatar_url || avatarUrl;
			} else {
				const { error: insertError } = await supabase
					.from('profiles')
					.insert({ id: $session.user.id, avatar_url: avatarUrl });
				if (insertError) {
					console.error('Error creating profile:', insertError);
				}
			}
		}
	});

	async function updateProfile() {
		const { error } = await supabase.from('profiles').upsert(
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

<div class="mx-auto mt-10 max-w-2xl rounded-lg bg-gray-800 p-8 shadow-lg">
	<h1 class="mb-8 text-center text-3xl font-bold text-white">User Profile</h1>
	<div class="mb-8 flex items-center justify-center">
		<div class="relative">
			<img
				src={avatarUrl || 'https://via.placeholder.com/150'}
				alt="Avatar"
				class="h-32 w-32 rounded-full border-4 border-indigo-500 object-cover"
			/>
		</div>
	</div>
	<form on:submit|preventDefault={updateProfile} class="space-y-6">
		<div>
			<label for="email" class="block text-sm font-medium text-gray-300">Email</label>
			<input
				id="email"
				value={email}
				readonly
				class="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			/>
		</div>
		<div>
			<label for="name" class="block text-sm font-medium text-gray-300">Name</label>
			<input
				id="name"
				value={name}
				readonly
				class="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			/>
		</div>
		<div>
			<label for="username" class="block text-sm font-medium text-gray-300">Username</label>
			<input
				id="username"
				bind:value={username}
				class="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			/>
		</div>
		<div>
			<label for="website" class="block text-sm font-medium text-gray-300">Website</label>
			<input
				id="website"
				bind:value={website}
				class="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			/>
		</div>
		<button
			type="submit"
			class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
		>
			Update Profile
		</button>
	</form>
</div>
