<div class="home">
	<nav class="home-nav">
		<a href="/portfolio" class="nav-link">PORTFOLIO</a>
		<a href="/about" class="nav-link">ABOUT</a>
		<a href="/contact" class="nav-link">CONTACT</a>
	</nav>
</div>

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
		gap: 2rem;
		align-items: center;
	}

	.nav-link {
		font-size: 3rem;
		font-weight: 600;
		color: #fff;
		text-decoration: none;
		letter-spacing: 0.2em;
		transition: transform 0.3s ease, opacity 0.3s ease;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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
			font-size: 2rem;
		}
	}
</style>
