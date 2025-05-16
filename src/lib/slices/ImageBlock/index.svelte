<script lang="ts">
	import type { Content } from '@prismicio/client';
	import { PrismicImage } from '@prismicio/svelte';

	export let slice: Content.ImageBlockSlice;
</script>

<PrismicImage field={slice.primary.image} class="not-prose w-ful h-full rounded-md my-10 md:my-14 lg:my-16 "/>

<!-- <section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	
</section> -->
