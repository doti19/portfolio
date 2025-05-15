import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
	// ssr:{
	// 	noExternal: ['three']
	// },
	plugins: [
		tailwindcss(),
		sveltekit()],
	server: {
		fs: {
			// Allow access to files from the project root.
			allow: ['..']
		}
	}
});
