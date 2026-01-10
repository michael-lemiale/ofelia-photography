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

	function isActive(path: string) {
		return page.url.pathname === path;
	}
</script>

<header>
	{#if isRootPage}
		<div class="container root-only">
			<h1 class="logo"><a href="/">OFELIA EME</a></h1>
		</div>
	{:else}
		<div class="container">
			<div class="menu-wrapper">
				<button class="menu-toggle" onclick={toggleMenu} aria-label="Toggle menu">
					<span class="bar"></span>
					<span class="bar"></span>
					<span class="bar"></span>
				</button>

				{#if isMenuOpen}
					<div class="menu-dropdown">
						<a href="/" class:active={isActive('/')} onclick={closeMenu}>Home</a>
						<a href="/portfolio" class:active={isActive('/portfolio')} onclick={closeMenu}>Portfolio</a>
						<a href="/about" class:active={isActive('/about')} onclick={closeMenu}>About</a>
					</div>
				{/if}
			</div>

			<h1 class="logo"><a href="/">OFELIA EME</a></h1>

			<nav class="desktop-nav">
				<a href="/portfolio" class:active={isActive('/portfolio')}>PORTFOLIO</a>
				<a href="/about" class:active={isActive('/about')}>ABOUT</a>
			</nav>
		</div>
	{/if}
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
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
	}

	/* Root page: center the logo and hide other controls */
	.container.root-only {
		grid-template-columns: 1fr;
		justify-items: center;
	}

	.container.root-only .logo {
		justify-self: center;
		text-align: center;
	}

	.menu-wrapper {
		position: relative;
		justify-self: start;
	}

	.logo {
		font-size: 2rem;
		font-weight: 600;
		color: #111;
		text-decoration: none;
		letter-spacing: 0.5rem;
		justify-self: start;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, .25);
	}

	.logo a {
		color: inherit;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.logo a:hover {
		opacity: 0.5;
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

	.menu-dropdown a.active {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.desktop-nav {
		display: flex;
		gap: 2rem;
		justify-self: end;
	}

	.desktop-nav a {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		color: #111;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.desktop-nav a:hover {
		opacity: 0.7;
	}

	.desktop-nav a.active {
		text-decoration: underline;
		text-underline-offset: 6px;
		text-decoration-thickness: 2px;
	}

	@media (max-width: 640px) {
		.container {
			position: relative;
			padding: 0 1rem;
			grid-template-columns: 1fr;
			justify-items: center;
		}

		/* Mobile: show hamburger fixed left, center logo, hide desktop nav */
		.menu-wrapper {
			display: block;
			position: absolute;
			left: 1rem;
			top: 50%;
			transform: translateY(-50%);
		}

		.logo {
			font-size: 1.25rem;
			justify-self: center;
			text-align: center;
		}

		.desktop-nav {
			display: none;
		}
	}

	/* Desktop: hide hamburger, show nav right, logo left */
	@media (min-width: 641px) {
		.menu-wrapper {
			display: none;
		}

		.logo {
			justify-self: start;
		}

		.desktop-nav {
			display: flex;
			justify-self: end;
		}
	}
</style>
