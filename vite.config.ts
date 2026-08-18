import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [
		enhancedImages(), // must come before sveltekit()
		tailwindcss(),
		sveltekit()
	],

	optimizeDeps: {
		exclude: ['@sveltejs/enhanced-img'],
		esbuildOptions: {
			loader: {
				'.node': 'empty'
			}
		}
	}
});
