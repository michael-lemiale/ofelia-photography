<div class="about">
	<div class="about-content">
		<div class="about-text">
			<p>
				Hello! I’m Ofelia, a Mexican American photographer based in Paris. I work with brands, creatives, and individuals to create images that feel natural, expressive, and intentional. My work is deeply influenced by a mix of cultures, textures, and everyday rituals. I’m especially inspired by subtle gestures, simplicity, and the beauty of the in between — the moments that often say the most. I'm based in Paris, France and available for projects worldwide.
			</p>
			<p>
				My approach to photography is rooted in observation and ease. I’m drawn to honest moments, thoughtful details, and images that feel lived in rather than staged. Whether I’m photographing people, spaces, or products, my goal is always the same — to create work that feels timeless, refined, and grounded. I aim to make shoots feel collaborative and unforced — creating space for comfort, movement, and authenticity.
			</p>
			<p>
				<a href="https://www.instagram.com/ofeliaemephoto" target="_blank" rel="noopener noreferrer"
					>@ofeliaemephoto</a
				>
			</p>
		</div>
	</div>
	<footer class="about-footer">© 2026 Ofelia Eme Photo. All Rights Reserved.</footer>
</div>

<style>
	.about {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.about-content {
		text-align: left;
	}

	.about-text {
		line-height: 1.8;
		color: #333;
	}

	/* Make links clearly underlined and obvious on hover */
	.about-text a {
		color: #000;
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-thickness: 1px;
		transition:
			color 0.2s ease,
			text-underline-offset 0.2s ease,
			text-decoration-thickness 0.2s ease;
	}

	.about-text a:hover,
	.about-text a:focus-visible {
		color: #111;
		text-underline-offset: 3px;
		text-decoration-thickness: 2px;
	}

	.about-text p {
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}

	.about-text p:last-child {
		margin-bottom: 0;
	}

	.about-footer {
		margin-top: 2rem;
		font-size: 0.85rem;
		color: #666;
		letter-spacing: 0.02em;
	}

	@media (max-width: 768px) {
		.about {
			padding: 2rem 1rem;
		}
		.about-text p {
			font-size: 1rem;
		}
	}
</style>
