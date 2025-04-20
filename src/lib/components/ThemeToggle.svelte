<script lang="ts">
	import { onMount } from 'svelte';

	let isDarkMode = true;

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		isDarkMode = savedTheme !== 'light';
		setTheme(isDarkMode);
	});

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		setTheme(isDarkMode);
	}

	function setTheme(dark: boolean) {
		localStorage.setItem('theme', dark ? 'dark' : 'light');
		document.documentElement.classList.toggle('dark', dark);
	}
</script>

<button on:click={toggleTheme} class="rounded-full p-2 hover:bg-gray-700 dark:hover:bg-gray-600">
	{#if isDarkMode}
		<svg
			class="h-6 w-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else}
		<svg
			class="h-6 w-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
	{/if}
</button>
