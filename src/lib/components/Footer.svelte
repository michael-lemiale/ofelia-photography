<script lang="ts">
	import { site } from '$lib/siteConfig';
</script>

<footer>
	<div class="row">
		<span>{site.location.toUpperCase()}</span>
		<span class="sep">&middot;</span>
		<a href={site.social.instagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
		<span class="sep">&middot;</span>
		<a href={`mailto:${site.contactEmail}`}>{site.contactEmail.toUpperCase()}</a>
		<span class="sep">&middot;</span>
		<span>&copy; 2026 OFELIA EME &mdash; ALL RIGHTS RESERVED</span>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--color-hairline);
		padding: 1.5rem 2rem;
	}

	.row {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink-secondary);
	}

	.row a {
		color: inherit;
		text-decoration: none;
	}

	.row a:hover {
		color: var(--color-ink);
	}

	.sep {
		display: inline;
	}

	@media (max-width: 640px) {
		footer {
			padding: 1.5rem 1rem;
		}

		.row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.sep {
			display: none;
		}
	}
</style>
