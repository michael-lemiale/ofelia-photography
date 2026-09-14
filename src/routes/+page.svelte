<script lang="ts">
	import Gallery from '$lib/components/Gallery.svelte';

	let { data } = $props();
</script>

<Gallery images={data.images} />
