<script lang="ts">
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Writable } from 'svelte/store';

	const carouselReady = getContext<Writable<boolean>>('carouselReady');
</script>

{#if $carouselReady}
	<div class="home" transition:fade={{ duration: 200 }}>
		<nav class="home-nav">
			<a href="/portfolio" class="nav-link">PORTFOLIO</a>
			<a href="/about" class="nav-link">ABOUT</a>
		</nav>
	</div>
{/if}

<style>
	.home {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 70vh;
	}

	.home-nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.nav-link {
		font-size: 1.5rem;
		font-weight: 500;
		color: #fff;
		text-decoration: none;
		letter-spacing: 0.2em;
		transition:
			transform 0.3s ease,
			opacity 0.3s ease;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.75);
	}

	.nav-link:hover {
		transform: scale(1.05);
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.home-nav {
			gap: 1.5rem;
		}

		.nav-link {
			font-size: 1rem;
		}
	}
</style>
