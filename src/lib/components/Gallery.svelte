<script lang="ts">
	import ImageGuard from '$lib/components/ImageGuard.svelte';
	import type { GalleryImage } from '$lib/server/gallery';

	interface Props {
		images: GalleryImage[];
	}

	let { images }: Props = $props();

	/**
	 * Pairs of consecutive images. Each pair renders as one flex row where
	 * `flex-grow` equals the image's own aspect ratio, so the row fills its
	 * width exactly while both images share one height — no JS measuring,
	 * no resize listeners. An odd trailing image renders alone.
	 */
	let rows = $derived.by(() => {
		const grouped: GalleryImage[][] = [];
		for (let i = 0; i < images.length; i += 2) {
			grouped.push(images.slice(i, i + 2));
		}
		return grouped;
	});
</script>

<div class="gallery">
	{#each rows as row (row.map((img) => img.key).join('|'))}
		<div class="row">
			{#each row as item (item.key)}
				<div
					class="item"
					style={`flex-grow: ${item.width / item.height}; flex-shrink: 1; flex-basis: 0; aspect-ratio: ${item.width} / ${item.height};`}
				>
					<ImageGuard />
					<!-- Thumbs are 800px wide, too soft for a tile that can render past
					     900px on desktop. The originals are large enough that a whole
					     category of them exhausted mobile Safari's decode budget, so
					     the original is served only above the single-column breakpoint. -->
					<picture>
						<source media="(min-width: 769px)" srcset={item.url} />
						<img
							src={item.thumbUrl}
							alt=""
							draggable="false"
							loading="lazy"
							decoding="async"
							width={item.width}
							height={item.height}
						/>
					</picture>
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.gallery {
		max-width: 1400px;
		margin: 0 auto;
		padding: 3rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.row {
		display: flex;
		gap: 1.5rem;
	}

	.item {
		position: relative;
		overflow: hidden;
		min-width: 0;
		max-width: 100%;
	}

	.item img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		-webkit-user-drag: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	.item picture {
		display: contents;
	}

	@media (max-width: 768px) {
		.gallery {
			padding: 2rem 1rem;
			gap: 1rem;
		}

		.row {
			flex-direction: column;
			gap: 1rem;
		}

		.item {
			flex: none !important;
		}
	}
</style>
