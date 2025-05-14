<script lang="ts">
	import type { Content } from '@prismicio/client';

	export let slice: Content.HeroSlice;
</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	<h1>
		<span>

			{slice.primary.first_name}
		</span>
		<span>

			{slice.primary.last_name}
		</span>
	</h1>
	<h2>
		<span>

			{slice.primary.tag_line}
		</span>
</section>
