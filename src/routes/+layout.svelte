<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	const imageModules: Record<string, { default: string }> = import.meta.glob(
		'$lib/assets/img/*.{jpg,jpeg,png,webp,avif}',
		{
			eager: true,
			query: {
				enhanced: true
			}
		}
	);

	const images = Object.values(imageModules).map((module) => module.default);
	
	// Start at a random position
	const randomStart = Math.floor(Math.random() * images.length);
	const rotatedImages = [...images.slice(randomStart), ...images.slice(0, randomStart)];
	
	// Duplicate images for seamless loop (triplicate for smoother wrap)
	const duplicatedImages = [...rotatedImages, ...rotatedImages, ...rotatedImages];

	// Generate varied heights (in vh) to leave whitespace at the top
	// Range: 60vh to 90vh for pleasing variation
	const heightsVh: number[] = duplicatedImages.map(() => {
		const min = 60;
		const max = 90;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	});

	let isRootPage = $derived(page.url.pathname === '/');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="app" class:off-white={!isRootPage}>
	{#if isRootPage}
		<div class="carousel-background">
			<div class="carousel-track">
				{#each duplicatedImages as image, i}
					<div class="carousel-image" style={`height: ${heightsVh[i]}vh;`}>
						<enhanced:img src={image} alt="Photography by Ofelia Eme" />
					</div>
				{/each}
			</div>
			<div class="overlay"></div>
		</div>
	{/if}

	<Header />
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
	}

	.carousel-image :global(img) {
		height: 100%;
		width: auto;
		object-fit: contain;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.1);
		z-index: 1;
	}
</style>
