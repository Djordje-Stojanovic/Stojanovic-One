import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['pdfjs-dist/build/pdf.worker.mjs']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					pdfjs: ['pdfjs-dist']
				}
			}
		}
	}
});
