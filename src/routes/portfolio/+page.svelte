<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { writable, get } from 'svelte/store';
	import { portfolioCache, type PortfolioItem } from '$lib/stores/portfolio';

	let imageElements = $state<PortfolioItem[]>([]);
	const gridReady = writable(false);

	// Fisher-Yates shuffle algorithm
	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Initialize from cache synchronously to avoid first-render spinner
	{
		const cached = get(portfolioCache);
		if (cached.ready) {
			imageElements = cached.elements;
			gridReady.set(true);
		}
	}

	onMount(() => {
		const unsubscribe = portfolioCache.subscribe((cache) => {
			if (cache.ready && imageElements.length === 0) {
				imageElements = cache.elements;
				gridReady.set(true);
			}
		});

		// If cache not ready, load from API
		let currentCache: { elements: PortfolioItem[]; ready: boolean } | undefined;
		const unsubOnce = portfolioCache.subscribe((c) => (currentCache = c));
		unsubOnce();
		if (currentCache && currentCache.ready) {
			// already handled via subscription
			return () => unsubscribe();
		}

		// Fetch images from R2 via API
		fetch('/api/images')
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					console.error('Failed to load images:', data.error);
					return;
				}

				// Load images to determine orientation
				const loads = data.images.map(
					(image: { url: string; key: string; filename: string }) =>
						new Promise<PortfolioItem>((resolve) => {
							const img = new Image();
							img.onload = () =>
								resolve({
									url: image.url,
									key: image.key,
									filename: image.filename,
									isPortrait: img.height > img.width
								});
							img.onerror = () =>
								resolve({
									url: image.url,
									key: image.key,
									filename: image.filename,
									isPortrait: false
								});
							img.src = image.url;
						})
				);

				Promise.all(loads).then((results) => {
					// Shuffle the results for randomized display
					const shuffled = shuffleArray(results);
					imageElements = shuffled;
					gridReady.set(true);
					portfolioCache.set({ elements: shuffled, ready: true });
				});
			})
			.catch((error) => {
				console.error('Failed to fetch images:', error);
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
					<!-- Transparent overlay to intercept right-click/long-press/drag -->
					<div
						class="image-guard"
						aria-hidden="true"
						oncontextmenu={(e) => e.preventDefault()}
						onpointerdown={(e) => e.preventDefault()}
						ondragstart={(e) => e.preventDefault()}
					></div>
					<img src={item.url} alt="Photography by Ofelia" draggable="false" loading="lazy" />
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="loading-background"
			role="status"
			aria-busy="true"
			aria-label="Loading portfolio images"
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
		background: #f5f5f5;
	}

	/* Overlay guard prevents context menu and long-press save */
	.image-guard {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: transparent;
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
		pointer-events: none; /* prevent click/context on the img itself */
		-webkit-user-drag: none;
		user-select: none;
		-webkit-touch-callout: none; /* iOS long-press menu */
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
