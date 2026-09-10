<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'WORK' },
		{ href: '/travel', label: 'TRAVEL' },
		{ href: '/about', label: 'ABOUT' }
	];

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	function isActive(path: string) {
		return page.url.pathname === path;
	}
</script>

<header>
	<div class="bar">
		<button class="menu-toggle" onclick={toggleMenu} aria-expanded={isMenuOpen}>
			{isMenuOpen ? 'CLOSE' : 'MENU'}
		</button>

		<h1 class="wordmark"><a href="/">OFELIA EME</a></h1>

		<nav class="desktop-nav">
			{#each links as { href, label } (href)}
				<a {href} class:active={isActive(href)}>{label}</a>
			{/each}
		</nav>
	</div>
</header>

{#if isMenuOpen}
	<div class="overlay">
		<nav class="overlay-nav">
			{#each links as { href, label } (href)}
				<a {href} class:active={isActive(href)} onclick={closeMenu}>{label}</a>
			{/each}
		</nav>
	</div>
{/if}

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-hairline);
	}

	.bar {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1.25rem 2rem;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
	}

	.wordmark {
		grid-column: 2;
		justify-self: center;
		font-family: var(--font-serif);
		font-size: 1.5rem;
		letter-spacing: 0.35em;
		text-align: center;
	}

	.wordmark a {
		color: var(--color-ink);
		text-decoration: none;
	}

	.desktop-nav {
		grid-column: 3;
		justify-self: end;
		display: flex;
		gap: 1.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
	}

	.desktop-nav a {
		color: var(--color-ink);
		text-decoration: none;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid transparent;
	}

	.desktop-nav a.active {
		border-bottom-color: var(--color-ink);
	}

	.menu-toggle {
		display: none;
		grid-column: 1;
		justify-self: start;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		color: var(--color-ink);
	}

	.overlay {
		display: none;
	}

	@media (max-width: 640px) {
		.bar {
			padding: 1rem;
			grid-template-columns: auto 1fr auto;
		}

		.wordmark {
			font-size: 1.1rem;
			letter-spacing: 0.25em;
		}

		.desktop-nav {
			display: none;
		}

		.menu-toggle {
			display: block;
		}

		.overlay {
			display: flex;
			position: fixed;
			inset: 0;
			z-index: 99;
			background: var(--color-bg);
			align-items: center;
			justify-content: center;
		}

		.overlay-nav {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 2rem;
			font-family: var(--font-mono);
			font-size: 1.1rem;
			letter-spacing: 0.15em;
		}

		.overlay-nav a {
			color: var(--color-ink);
			text-decoration: none;
		}

		.overlay-nav a.active {
			text-decoration: underline;
			text-underline-offset: 6px;
		}
	}
</style>
