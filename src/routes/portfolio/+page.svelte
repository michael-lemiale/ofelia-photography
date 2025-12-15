<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	const imageModules: Record<string, { default: any }> = import.meta.glob(
		'$lib/assets/img/*.{jpg,jpeg,png,webp,avif}',
		{
			eager: true,
		}
	);

	let imageElements = $state<{ path: string; module: any; isPortrait: boolean }[]>([]);
	let isReady = $state(false);

	function resolveSrc(mod: any): string {
		const m = mod?.default ?? mod;
		return m?.img?.src || m?.src || (typeof m === 'string' ? m : '');
	}

	onMount(() => {
		const entries = Object.entries(imageModules);
		const loads = entries.map(([path, mod]) =>
			new Promise<{ path: string; module: any; isPortrait: boolean }>((resolve) => {
				const img = new Image();
				img.onload = () =>
					resolve({
						path,
						module: mod.default,
						isPortrait: img.height > img.width
					});
				img.onerror = () =>
					resolve({ path, module: mod.default, isPortrait: false });
				img.src = resolveSrc(mod);
			})
		);

		Promise.all(loads).then((results) => {
			imageElements = results;
			isReady = true;
		});
	});
</script>


<div class="gallery">
	{#if isReady}
	<div class="gallery-grid" transition:fade={{ duration: 1200 }}>
		{#each imageElements as { path, module, isPortrait }}
			<div class="gallery-item" class:portrait={isPortrait} class:landscape={!isPortrait}>
				<enhanced:img src={module} alt="Photography by Ofelia" />
			</div>
		{/each}
	</div>
	{:else}
	<div class="loading-background" role="status" aria-busy="true" aria-label="Loading portfolio images" transition:fade={{ duration: 1000 }}>
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
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
