<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { loadCategoryImages, type WorkCategory } from '$lib/imageLoader';
	import { portfolioCaches, type PortfolioItem } from '$lib/stores/portfolio';
	import { get } from 'svelte/store';
	import ImageGuard from '$lib/components/ImageGuard.svelte';

	const categories: { slug: WorkCategory; label: string }[] = [
		{ slug: 'fashion', label: 'Fashion' },
		{ slug: 'portraits', label: 'Portraits' },
		{ slug: 'spaces', label: 'Spaces' },
		{ slug: 'events', label: 'Events' }
	];

	type CategoryState = {
		ready: boolean;
		thumbnail: PortfolioItem | null;
	};

	let categoryStates = $state<Record<WorkCategory, CategoryState>>({
		fashion: { ready: false, thumbnail: null },
		portraits: { ready: false, thumbnail: null },
		spaces: { ready: false, thumbnail: null },
		events: { ready: false, thumbnail: null }
	});

	async function loadCategory(slug: WorkCategory) {
		// Check if already cached
		const cached = get(portfolioCaches[slug]);
		if (cached.ready && cached.elements.length > 0) {
			const rand = Math.floor(Math.random() * cached.elements.length);
			categoryStates[slug] = { ready: true, thumbnail: cached.elements[rand] };
			return;
		}

		try {
			const items = await loadCategoryImages(slug);
			portfolioCaches[slug].set({ elements: items, ready: true });
			if (items.length > 0) {
				const rand = Math.floor(Math.random() * items.length);
				categoryStates[slug] = { ready: true, thumbnail: items[rand] };
			} else {
				categoryStates[slug] = { ready: true, thumbnail: null };
			}
		} catch (error) {
			console.error(`Failed to load ${slug} images:`, error);
			categoryStates[slug] = { ready: true, thumbnail: null };
		}
	}

	onMount(() => {
		categories.forEach((c) => loadCategory(c.slug));
	});
</script>

<div class="work-overview">
	<div class="categories">
		{#each categories as { slug, label } (slug)}
			<div class="category-card">
				{#if categoryStates[slug].ready}
					<a href="/work/{slug}" class="category-link" transition:fade={{ duration: 800 }}>
						{#if categoryStates[slug].thumbnail}
							<div class="image-wrapper">
							<ImageGuard />
								<img
									src={categoryStates[slug].thumbnail?.thumbUrl}
									alt=""
									draggable="false"
									loading="lazy"
								/>
								<span class="category-label">{label}</span>
							</div>
						{:else}
							<div class="placeholder">
								<span class="category-label">{label}</span>
							</div>
						{/if}
					</a>
				{:else}
					<div
						class="loading-card"
						role="status"
						aria-busy="true"
						aria-label="Loading {label}"
						transition:fade={{ duration: 800 }}
					></div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.work-overview {
		max-width: 1400px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.categories {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}

	.category-card {
		position: relative;
		min-height: 300px;
	}

	.category-link {
		display: block;
		text-decoration: none;
		color: inherit;
		position: relative;
	}

	.image-wrapper {
		position: relative;
		overflow: hidden;
		aspect-ratio: 3 / 4;
		background: linear-gradient(160deg, #d6d6d6, #f0f0f0);
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
		pointer-events: none;
		-webkit-user-drag: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	.category-link:hover .image-wrapper img {
		transform: scale(1.05);
	}

	.placeholder {
		position: relative;
		aspect-ratio: 3 / 4;
		background: linear-gradient(160deg, #d6d6d6, #f0f0f0);
	}

	.category-label {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: 0.15em;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.75);
		text-transform: uppercase;
		color: #fff;
		z-index: 3;
		pointer-events: none;
	}

	.loading-card {
		aspect-ratio: 3 / 4;
		background: linear-gradient(160deg, #d6d6d6, #f0f0f0);
	}

	@media (max-width: 768px) {
		.work-overview {
			padding: 2rem 1rem;
		}

		.categories {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
	}
</style>
