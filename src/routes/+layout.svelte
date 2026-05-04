<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';
	import { onMount, setContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { site } from '$lib/siteConfig';
	import { jsonLdOrganization, jsonLdWebSite } from '$lib/seo';
	import ImageGuard from '$lib/components/ImageGuard.svelte';
	import { portfolioCaches, type PortfolioItem } from '$lib/stores/portfolio';
	import { shuffleArray, type WorkCategory } from '$lib/imageLoader';

	let { data, children } = $props();

	interface CarouselImage {
		url: string;
		thumbUrl: string;
		width: number;
		height: number;
	}

	let images: CarouselImage[] = $state([]);

	let isCarouselReady = $state(false);
	const carouselReady = writable(false);
	setContext('carouselReady', carouselReady);

	/**
	 * How many images to eagerly preload before revealing the carousel.
	 * Covers roughly 2 viewports worth at typical aspect ratios.
	 */
	const EAGER_COUNT = 12;

	// Ensure --vh reflects the visual viewport height on mobile
	function setVhVar() {
		if (typeof window === 'undefined') return;
		const vv = (window as any).visualViewport;
		const height = vv && typeof vv.height === 'number' ? vv.height : window.innerHeight;
		const vh = height * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}
	onMount(() => {
		setVhVar();
		const onWinResize = () => setVhVar();
		window.addEventListener('resize', onWinResize, { passive: true });
		const vv = (window as any).visualViewport;
		const onVvResize = () => setVhVar();
		const onVvScroll = () => setVhVar();
		if (vv) {
			vv.addEventListener('resize', onVvResize, { passive: true });
			vv.addEventListener('scroll', onVvScroll, { passive: true });
		}
		return () => {
			window.removeEventListener('resize', onWinResize as any);
			if (vv) {
				vv.removeEventListener('resize', onVvResize as any);
				vv.removeEventListener('scroll', onVvScroll as any);
			}
		};
	});

	function loadImage(src: string): Promise<void> {
		return new Promise<void>((resolve) => {
			const img = new Image();
			img.decoding = 'async' as any;
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = src;
		});
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/images');
			const data = await response.json();
			if (data.images && data.images.length > 0) {
				images = shuffleArray(
					data.images.map((img: any) => ({
						url: img.url,
						thumbUrl: img.thumbUrl || img.url,
						width: img.width || 0,
						height: img.height || 0
					}))
				);

				// Pre-populate per-category caches with full-res URLs so gallery
				// pages are instant and show originals without a separate API fetch.
				const validCategories = new Set<WorkCategory>(['fashion', 'portraits', 'spaces', 'events']);
				const categoryMap: Partial<Record<WorkCategory, PortfolioItem[]>> = {};
				for (const img of data.images as any[]) {
					const parts = (img.key as string).split('/');
					if (parts.length >= 3) {
						const cat = parts[1] as WorkCategory;
						if (validCategories.has(cat)) {
							(categoryMap[cat] ??= []).push({
								url: img.url,
								thumbUrl: img.thumbUrl || img.url,
								key: img.key,
								filename: img.filename,
								isPortrait: img.isPortrait ?? img.height > img.width
							});
						}
					}
				}
				for (const [cat, items] of Object.entries(categoryMap) as [WorkCategory, PortfolioItem[]][]) {
					portfolioCaches[cat].set({ elements: shuffleArray(items), ready: true });
				}
			} else {
				console.error('No images found from R2');
				images = [];
			}
		} catch (error) {
			console.error('Failed to load carousel images:', error);
			images = [];
		}

		if (images.length === 0) {
			isCarouselReady = true;
			carouselReady.set(true);
			return;
		}

		// Eagerly preload only the first batch — enough to fill the visible viewport.
		// The rest use loading="lazy" and the browser fetches them as the CSS
		// animation scrolls them toward the viewport.
		const eagerUrls = images.slice(0, EAGER_COUNT).map((img) => img.thumbUrl);
		await Promise.all(eagerUrls.map((u) => loadImage(u)));

		isCarouselReady = true;
		carouselReady.set(true);
	});

	// Start at a random position
	let randomStart = $derived(Math.floor(Math.random() * images.length));
	let rotatedImages = $derived([
		...images.slice(randomStart),
		...images.slice(0, randomStart)
	]);

	// Duplicate images for seamless loop (2x is sufficient for -50% translate)
	let duplicatedImages = $derived([...rotatedImages, ...rotatedImages]);

	// Vary image heights for visual interest, kept identical across duplicates
	const heightOptions = [60, 75, 90];
	let baseHeightsVh = $derived.by(() => {
		const heights: number[] = [];
		let last: number | null = null;
		let streak = 0;

		for (let i = 0; i < rotatedImages.length; i++) {
			let choice = heightOptions[Math.floor(Math.random() * heightOptions.length)];
			if (last !== null && streak >= 2 && choice === last) {
				const alternatives = heightOptions.filter((h) => h !== last);
				choice = alternatives[Math.floor(Math.random() * alternatives.length)];
			}
			heights.push(choice);
			if (last === choice) streak += 1;
			else {
				last = choice;
				streak = 1;
			}
		}

		// Prevent wrap-around triple across the seam
		if (
			heights.length >= 2 &&
			heights[heights.length - 1] === heights[0] &&
			heights[0] === heights[1]
		) {
			const forbidden = new Set([heights[0]]);
			const alt = heightOptions.find((h) => !forbidden.has(h));
			if (alt !== undefined) heights[0] = alt;
		}

		return heights;
	});

	let heightsVh = $derived([...baseHeightsVh, ...baseHeightsVh]);

	let isRootPage = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<title>{data?.title ?? site.defaultTitle}</title>
	<meta name="description" content={data?.description ?? site.defaultDescription} />
	<meta name="robots" content="index, follow" />
	<link rel="icon" href={favicon} />
	{#if data?.canonical}
		<link rel="canonical" href={data.canonical} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={data?.title ?? site.defaultTitle} />
	<meta property="og:description" content={data?.description ?? site.defaultDescription} />
	<meta property="og:url" content={data?.canonical ?? site.url} />
	<meta
		property="og:image"
		content={data?.ogImage?.startsWith('http')
			? data.ogImage
			: site.url + (data?.ogImage ?? site.defaultOgImage)}
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data?.title ?? site.defaultTitle} />
	<meta name="twitter:description" content={data?.description ?? site.defaultDescription} />
	<meta
		name="twitter:image"
		content={data?.ogImage?.startsWith('http')
			? data.ogImage
			: site.url + (data?.ogImage ?? site.defaultOgImage)}
	/>

	<!-- Structured Data -->
	<!-- prettier-ignore -->
	<script type="application/ld+json">
{@html JSON.stringify(jsonLdOrganization())}
	</script>
	<!-- prettier-ignore -->
	<script type="application/ld+json">
{@html JSON.stringify(jsonLdWebSite())}
	</script>
</svelte:head>
<div class="app" class:off-white={!isRootPage}>
	<Header />
	{#if isRootPage}
		{#if isCarouselReady}
			<div class="carousel-background" transition:fade={{ duration: 800 }}>
				<div class="carousel-track">
					{#each duplicatedImages as img, i}
						{@const idx = i % rotatedImages.length}
						<div
							class="carousel-image"
							style={`height: calc(var(--vh) * ${heightsVh[i]}); aspect-ratio: ${img.width} / ${img.height};`}
						>
							<ImageGuard />
							<img
								src={img.thumbUrl}
								alt=""
								width={img.width || undefined}
								height={img.height || undefined}
								loading={idx < EAGER_COUNT ? 'eager' : 'lazy'}
								decoding="async"
							/>
						</div>
					{/each}
				</div>
				<div class="overlay"></div>
			</div>
		{:else}
			<div
				class="loading-background"
				transition:fade={{ duration: 2000 }}
				aria-busy="true"
				role="status"
				aria-label="Loading photos"
			>
				<div class="spinner"></div>
			</div>
		{/if}
	{/if}
	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(html, body) {
		height: 100%;
		margin: 0;
		background: #f5f5f5;
	}

	.app {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app.off-white {
		background-color: #f5f5f5;
	}

	main {
		flex: 1;
		position: relative;
		z-index: 2;
	}

	.carousel-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh; /* fallback */
		height: 100svh; /* small viewport height */
		height: 100dvh; /* dynamic viewport height */
		height: calc(var(--vh) * 100); /* JS-set visual viewport height */
		z-index: 0;
		overflow: hidden;
		background: #f5f5f5;
	}

	.loading-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh; /* fallback */
		height: 100svh; /* small viewport height */
		height: 100dvh; /* dynamic viewport height */
		height: calc(var(--vh) * 100); /* JS-set visual viewport height */
		z-index: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
	}

	.carousel-track {
		display: flex;
		position: absolute;
		bottom: 0;
		left: 0;
		height: 100vh; /* fallback */
		height: 100svh; /* small viewport height to avoid mobile UI gaps */
		height: 100dvh; /* dynamic viewport height */
		height: calc(var(--vh) * 100); /* JS-set visual viewport height */
		width: max-content;
		animation: scroll 600s linear infinite;
		align-items: flex-end;
		will-change: transform;
	}

	@keyframes scroll {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			/* Move exactly half of the duplicated track width for seamless looping */
			transform: translate3d(-50%, 0, 0);
		}
	}

	.carousel-image {
		position: relative;
		flex-shrink: 0;
		max-height: 100%;
		display: flex;
		align-items: flex-end; /* ensure image bottom aligns with viewport bottom */
		justify-content: flex-start; /* avoid internal horizontal gaps */
		margin: 2px;
		/* Blend with page background so unloaded slots are invisible, not grey boxes */
		background: transparent;
	}

	.carousel-image :global(img) {
		height: 100%;
		width: auto; /* natural width from height & aspect ratio */
		max-width: none; /* allow width to grow to satisfy height */
		object-fit: contain;
		display: block;
		pointer-events: none; /* prevent click/context on the img itself */
		-webkit-user-drag: none;
		user-select: none;
		-webkit-touch-callout: none; /* iOS long-press menu */
		/* Smooth fade-in as each image loads */
		animation: fadeIn 0.6s ease both;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}


	/* Keep a reasonable cap for large screens only */
	@media (min-width: 1024px) {
		.carousel-image :global(img) {
			max-width: 1100px;
		}
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.05);
		z-index: 1;
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

	/* Use a safe viewport unit for dynamic heights (fallback to 1vh) */
	:root {
		--vh: 1vh;
	}
	@supports (height: 1svh) {
		:root {
			--vh: 1svh;
		}
	}
	@supports (height: 1dvh) {
		:root {
			--vh: 1dvh;
		}
	}
</style>
