<script lang="ts">
	import { site } from '$lib/siteConfig';

	let { data } = $props();
</script>

<div class="about" class:no-portrait={!data.portraitUrl}>
	{#if data.portraitUrl}
		<div class="portrait">
			<img src={data.portraitUrl} alt="Ofelia Eme" loading="lazy" />
		</div>
	{/if}

	<div class="content">
		<h2 class="headline">{site.defaultDescription}</h2>

		<div class="bio">
			<p>
				Hello! I'm Ofelia, a Mexican American photographer based in Paris. I work with brands,
				creatives, and individuals to create images that feel natural, expressive, and intentional.
				My work is deeply influenced by a mix of cultures, textures, and everyday rituals. I'm
				especially inspired by simplicity and the beauty of the in-between — the moments that often
				say the most.
			</p>
			<p>
				I aim to make shoots feel collaborative and unforced — creating space for ease, movement,
				and real moments. Whether I'm photographing people, spaces, or products, the goal is always
				the same: work that feels timeless, grounded, and distinctly lived. My approach is rooted in
				observation. I'm drawn to reflections and obstructions — those layered moments that reveal
				the most.
			</p>
		</div>

		<hr />

		<div class="grid">
			{#if site.clients.length > 0}
				<div class="cell">
					<span class="label">Clients</span>
					<span class="value">{site.clients.join(', ')}</span>
				</div>
			{/if}
			{#if site.published.length > 0}
				<div class="cell">
					<span class="label">Published</span>
					<span class="value">{site.published.join(', ')}</span>
				</div>
			{/if}
			<div class="cell">
				<span class="label">Inquiries</span>
				<span class="value"><a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></span>
			</div>
			<div class="cell">
				<span class="label">Elsewhere</span>
				<span class="value"
					><a href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a
					></span
				>
			</div>
		</div>
	</div>
</div>

<style>
	.about {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
		display: grid;
		grid-template-columns: 40% 1fr;
		gap: 3rem;
		align-items: start;
	}

	.about.no-portrait {
		grid-template-columns: 1fr;
	}

	.portrait img {
		display: block;
		width: 100%;
		height: auto;
	}

	.headline {
		font-size: 1.75rem;
		font-weight: 400;
		line-height: 1.4;
		margin-bottom: 2rem;
	}

	.bio {
		line-height: 1.8;
		color: var(--color-ink);
	}

	.bio p {
		margin: 0 0 1.5rem;
	}

	.bio p:last-child {
		margin-bottom: 0;
	}

	hr {
		border: none;
		border-top: 1px solid var(--color-hairline);
		margin: 2rem 0;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
	}

	.cell {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-ink-secondary);
	}

	.value {
		font-size: 0.95rem;
	}

	.value a {
		color: var(--color-ink);
	}

	@media (max-width: 768px) {
		.about {
			grid-template-columns: 1fr;
			padding: 2rem 1rem;
			gap: 2rem;
		}

		.headline {
			font-size: 1.4rem;
		}

		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
