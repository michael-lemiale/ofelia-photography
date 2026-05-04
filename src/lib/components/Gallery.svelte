<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { writable, get } from 'svelte/store';
	import { portfolioCaches, type PortfolioItem } from '$lib/stores/portfolio';
	import { loadCategoryImages, type WorkCategory } from '$lib/imageLoader';
	import ImageGuard from '$lib/components/ImageGuard.svelte';

	interface Props {
		category: WorkCategory;
	}

	let { category }: Props = $props();

	let imageElements = $state<PortfolioItem[]>([]);
	const gridReady = writable(false);

	onMount(() => {
		const cache = portfolioCaches[category];

		// Initialize from cache synchronously
		const cached = get(cache);
		if (cached.ready) {
			imageElements = cached.elements;
			gridReady.set(true);
		}

		const unsubscribe = cache.subscribe((c) => {
			if (c.ready && imageElements.length === 0) {
				imageElements = c.elements;
				gridReady.set(true);
			}
		});

		// If cache not ready, load from API
		const current = get(cache);
		if (current.ready) {
			return () => unsubscribe();
		}

		loadCategoryImages(category)
			.then((results) => {
				imageElements = results;
				gridReady.set(true);
				cache.set({ elements: results, ready: true });
			})
			.catch((error) => {
				console.error(`Failed to fetch ${category} images:`, error);
			});

		return () => unsubscribe();
	});
</script>

<div class="gallery">
	{#if $gridReady}
		<div class="gallery-grid" transition:fade={{ duration: 1200 }}>
			{#each imageElements as item (item.key)}
				<div
					class="gallery-item"
					class:portrait={item.isPortrait}
					class:landscape={!item.isPortrait}
				>
					<ImageGuard />
					<img
						src={item.url}
						alt=""
						draggable="false"
						loading="lazy"
						decoding="async"
						width={item.isPortrait ? 600 : 960}
						height={item.isPortrait ? 800 : 540}
					/>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="loading-background"
			role="status"
			aria-busy="true"
			aria-label="Loading images"
			transition:fade={{ duration: 1200 }}
		>
			<div class="spinner"></div>
		</div>
	{/if}
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
		background: linear-gradient(160deg, #d6d6d6, #f0f0f0);
	}


	.gallery-item.portrait {
		grid-column: span 1;
		aspect-ratio: 3 / 4;
	}

	.gallery-item.landscape {
		grid-column: span 2;
		aspect-ratio: 16 / 9;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
		pointer-events: none;
		-webkit-user-drag: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	.gallery-item:hover img {
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

	/* Loading state */
	.loading-background {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 0;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 4px solid rgba(0, 0, 0, 0.15);
		border-top-color: rgba(0, 0, 0, 0.5);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
