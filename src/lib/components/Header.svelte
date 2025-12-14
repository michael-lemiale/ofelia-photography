<script lang="ts">
	import { page } from '$app/state';

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	let isRootPage = $derived(page.url.pathname === '/');
</script>

<header>
	<div class="container">
		{#if !isRootPage}
			<div class="menu-wrapper">
				<button class="menu-toggle" onclick={toggleMenu} aria-label="Toggle menu">
					<span class="bar"></span>
					<span class="bar"></span>
					<span class="bar"></span>
				</button>

				{#if isMenuOpen}
					<div class="menu-dropdown">
						<a href="/" onclick={closeMenu}>Home</a>
						<a href="/portfolio" onclick={closeMenu}>Portfolio</a>
						<a href="/about" onclick={closeMenu}>About</a>
						<a href="/contact" onclick={closeMenu}>Contact</a>
					</div>
				{/if}
			</div>
		{:else}
			<div></div>
		{/if}

		<h1 class="logo"><a href="/">OFELIA EME</a></h1>
		<div></div>
	</div>
</header>

<style>
	header {
		padding: 1rem 0;
		position: relative;
		z-index: 100;
		background: transparent;
	}

	/* Fixed header styling: black text across all pages */

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
	}

	.menu-wrapper {
		position: relative;
		justify-self: start;
	}

	.logo {
		font-size: 3rem;
		font-weight: 600;
		color: #111;
		text-decoration: none;
		letter-spacing: 0.5rem;
		justify-self: center;
		text-shadow: none;
	}

	.logo a {
		color: inherit;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.logo a:hover {
		opacity: 0.7;
	}

	.menu-wrapper {
		position: relative;
	}

	.menu-toggle {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		z-index: 101;
		transition: transform 0.2s ease;
	}

	.menu-toggle:hover {
		transform: scale(1.1);
	}

	.bar {
		width: 24px;
		height: 2px;
		background-color: #111;
		border-radius: 2px;
		transition: all 0.3s ease;
	}

	.menu-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 0.5rem 0;
		min-width: 160px;
		z-index: 100;
		margin-top: 0.5rem;
	}

	.menu-dropdown a {
		display: block;
		padding: 0.75rem 1.5rem;
		color: #111;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.menu-dropdown a:hover {
		background-color: #f5f5f5;
	}

	@media (max-width: 640px) {
		.container {
			padding: 0 1rem;
		}

		.logo {
			font-size: 1.25rem;
		}
	}
</style>
