import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ['.']
		}
	},
	define: {
		'process.env': process.env
	},
	optimizeDeps: {
		exclude: ['@sveltejs/svelte-virtual-list']
	}
});
