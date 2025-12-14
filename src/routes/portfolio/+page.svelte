<script lang="ts">
	import { onMount } from 'svelte';

	const imageModules: Record<string, { default: any }> = import.meta.glob(
		'$lib/assets/img/*.{jpg,jpeg,png,webp,avif}',
		{
			eager: true,
			query: {
				enhanced: true
			}
		}
	);

	let imageElements: { path: string; module: any; isPortrait: boolean }[] = [];

	onMount(() => {
		// Determine aspect ratios for each image
		const images = Object.entries(imageModules);
		const loadPromises = images.map(([path, module]) => {
			return new Promise<{ path: string; module: any; isPortrait: boolean }>((resolve) => {
				const img = new Image();
				img.onload = () => {
					resolve({
						path,
						module: module.default,
						isPortrait: img.height > img.width
					});
				};
				// Enhanced images have sources object with different sizes
				const imgSrc = module.default?.sources?.[0]?.srcset?.split(' ')[0] || module.default?.img?.src || module.default;
				img.src = imgSrc;
			});
		});

		Promise.all(loadPromises).then((results) => {
			imageElements = results;
		});
	});
</script>

<div class="gallery">
	<div class="gallery-grid">
		{#each imageElements as { path, module, isPortrait }}
			<div class="gallery-item" class:portrait={isPortrait} class:landscape={!isPortrait}>
				<enhanced:img src={module} alt="Photography by Ofelia" />
			</div>
		{/each}
	</div>
</div>

<style>
	.gallery {
		max-width: 1400px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		grid-auto-flow: dense;
	}

	.gallery-item {
		position: relative;
		overflow: hidden;
		border-radius: 8px;
		background: #f5f5f5;
	}

	.gallery-item.portrait {
		grid-column: span 1;
		aspect-ratio: 3 / 4;
	}

	.gallery-item.landscape {
		grid-column: span 2;
		aspect-ratio: 16 / 9;
	}

	.gallery-item :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.gallery-item:hover :global(img) {
		transform: scale(1.05);
	}

	@media (max-width: 768px) {
		.gallery {
			padding: 2rem 1rem;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.gallery-item.landscape {
			grid-column: span 1;
		}
	}
</style>
