<script lang="ts">
	export let orientation: 'horizontal' | 'vertical' = 'horizontal';
	export let size: 'small' | 'medium' | 'large' = 'medium';

	interface SocialLink {
		name: string;
		url: string;
		icon: string;
	}

	const socialLinks: SocialLink[] = [
		{
			name: 'Instagram',
			url: 'https://www.instagram.com/ofeliaemephoto/',
			icon: 'instagram'
		},
		{
			name: 'TikTok',
			url: 'https://www.tiktok.com/@oferodrig',
			icon: 'tiktok'
		},
		{
			name: 'Substack',
			url: 'https://oferodrig.substack.com/',
			icon: 'substack'
		}
	];

	const sizeMap = {
		small: 18,
		medium: 22,
		large: 24
	};

	const iconSize = sizeMap[size];
</script>

<ul class="social-links" class:vertical={orientation === 'vertical'}>
	{#each socialLinks as { name, url, icon }}
		<li>
			<a href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
				{#if icon === 'instagram'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width={iconSize}
						height={iconSize}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
						<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
						<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
					</svg>
				{/if}
			</a>
		</li>
	{/each}
</ul>

<style>
	.social-links {
		display: flex;
		gap: 1.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
		align-items: center;
	}

	.social-links.vertical {
		flex-direction: column;
		align-items: flex-start;
	}

	.social-links a {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		transition: color 0.2s ease;
		text-decoration: none;
	}

	.social-links a:hover {
		color: #111;
	}

	@media (max-width: 640px) {
		.social-links {
			gap: 1rem;
		}
	}
</style>
