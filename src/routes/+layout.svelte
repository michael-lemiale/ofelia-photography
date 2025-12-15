<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';
	import { onMount, setContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';

	let { children } = $props();

	const imageModules: Record<string, { default: string }> = import.meta.glob(
		'$lib/assets/img/*.{jpg,jpeg,png,webp,avif}',
		{ eager: true }
	);

	// Always resolve to string URLs for runtime usage
	const imageUrls: string[] = Object.values(imageModules).map((m) => m.default);

	let isCarouselReady = $state(false);
	const carouselReady = writable(false);
	setContext('carouselReady', carouselReady);

	function loadImage(src: string) {
		return new Promise<void>((resolve) => {
			const img = new Image();
			img.decoding = 'async' as any;
			img.loading = 'eager' as any;
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = src;
		});
	}

	async function preloadImages(urls: string[]) {
		await Promise.all(urls.map((u) => loadImage(u)));
	}

	onMount(async () => {
		// Preload the unique set of images (not the duplicates)
		await preloadImages(imageUrls);
		console.log('Carousel image URLs:', imageUrls.slice(0, 5));
		isCarouselReady = true;
		carouselReady.set(true);
	});
	
	// Start at a random position
	const randomStart = Math.floor(Math.random() * imageUrls.length);
	const rotatedUrls = [...imageUrls.slice(randomStart), ...imageUrls.slice(0, randomStart)];
	
	// Duplicate images for seamless loop (triplicate for smoother wrap)
	const duplicatedUrls = [...rotatedUrls, ...rotatedUrls, ...rotatedUrls];

	// Vary image heights for visual interest, but keep them identical across triplicates
	const heightOptions = [50, 75, 100];
	const baseHeightsVh: number[] = [];
	{
		let last: number | null = null;
		let streak = 0; // count of consecutive same values
		for (let i = 0; i < rotatedUrls.length; i++) {
			let choice = heightOptions[Math.floor(Math.random() * heightOptions.length)];
			// Prevent forming a triple streak
			if (last !== null && streak >= 2 && choice === last) {
				const alternatives = heightOptions.filter((h) => h !== last);
				choice = alternatives[Math.floor(Math.random() * alternatives.length)];
			}
			baseHeightsVh.push(choice);
			if (last === choice) streak += 1;
			else {
				last = choice;
				streak = 1;
			}
		}

		// Also prevent a wrap-around triple across the seam of repeated tracks
		if (
			baseHeightsVh.length >= 2 &&
			baseHeightsVh[baseHeightsVh.length - 1] === baseHeightsVh[0] &&
			baseHeightsVh[0] === baseHeightsVh[1]
		) {
			const forbidden = new Set([baseHeightsVh[0]]);
			const alt = heightOptions.find((h) => !forbidden.has(h));
			if (alt !== undefined) baseHeightsVh[0] = alt;
		}
	}
	const heightsVh: number[] = [
		...baseHeightsVh,
		...baseHeightsVh,
		...baseHeightsVh
	];

	let isRootPage = $derived(page.url.pathname === '/');
</script>

<title>ofelia eme | film & digital photography | paris</title>
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="app" class:off-white={!isRootPage}>
	<Header />
	{#if isRootPage}
		{#if isCarouselReady}
			<div class="carousel-background" transition:fade={{ duration: 250 }}>
				<div class="carousel-track">
					{#each duplicatedUrls as url, i}
						<div class="carousel-image" style={`height: ${heightsVh[i]}vh;`}>
							<img src={url} alt="Photography by Ofelia Eme" />
						</div>
					{/each}
				</div>
				<div class="overlay"></div>
			</div>
		{:else}
			<div class="loading-background" transition:fade={{ duration: 2000 }} aria-busy="true" role="status" aria-label="Loading photos">
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
		height: 100%;
		z-index: 0;
		overflow: hidden;
		background: #f5f5f5;
	}

	.loading-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
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
		height: 100vh;
		width: max-content;
		animation: scroll 70s linear infinite;
		align-items: flex-end;
		will-change: transform;
	}

	@keyframes scroll {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			/* Move exactly one third of the triplicated track width for seamless looping */
			transform: translate3d(-33.3333%, 0, 0);
		}
	}

	.carousel-image {
		flex-shrink: 0;
		height: auto;
		max-height: 100%;
		width: auto;
		display: flex;
		align-items: flex-end; /* ensure image bottom aligns with viewport bottom */
		justify-content: flex-start; /* avoid internal horizontal gaps */
	}

	.carousel-image :global(img) {
		height: 100%;
		width: auto; /* natural width from height & aspect ratio */
		max-width: min(65vw, 1100px); /* cap extreme ballooning without forcing gaps */
		object-fit: contain;
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
</style>
