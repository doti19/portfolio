import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
	// ssr:{
	// 	noExternal: ['three']
	// },
	plugins: [
		tailwindcss(),
		sveltekit(),
	Icons({
      compiler: 'svelte',
	  autoInstall: true,
    })
	],
	server: {
		fs: {
			// Allow access to files from the project root.
			allow: ['..']
		}
	}
});
