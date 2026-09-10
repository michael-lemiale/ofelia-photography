<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'WORK' },
		{ href: '/travel', label: 'TRAVEL' },
		{ href: '/about', label: 'ABOUT' }
	];

	let isMenuOpen = $state(false);
	let dialogEl: HTMLDialogElement;

	function openMenu() {
		dialogEl.showModal();
		isMenuOpen = true;
	}

	// A native <dialog> opened with showModal() closes on Escape and makes
	// the rest of the document inert on its own, so neither needs wiring
	// up by hand here.
	function closeMenu() {
		dialogEl.close();
	}

	function toggleMenu() {
		if (isMenuOpen) closeMenu();
		else openMenu();
	}

	function isActive(path: string) {
		return page.url.pathname === path;
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = isMenuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<header>
	<div class="bar">
		<button
			class="menu-toggle"
			onclick={toggleMenu}
			aria-expanded={isMenuOpen}
			aria-controls="mobile-menu"
		>
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

<dialog id="mobile-menu" class="overlay" bind:this={dialogEl} onclose={() => (isMenuOpen = false)}>
	<nav class="overlay-nav">
		{#each links as { href, label } (href)}
			<a {href} class:active={isActive(href)} onclick={closeMenu}>{label}</a>
		{/each}
	</nav>
</dialog>

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
		margin: 0;
		padding: 0;
		border: none;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		background: var(--color-bg);
	}

	.overlay::backdrop {
		background: transparent;
	}

	.overlay[open] {
		display: flex;
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
	}
</style>
