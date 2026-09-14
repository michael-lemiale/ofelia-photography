<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { site } from '$lib/siteConfig';
	import { jsonLdOrganization, jsonLdWebSite } from '$lib/seo';
	import { page } from '$app/state';

	let { children } = $props();

	// `page.data` is the merged data of every load function in the route
	// hierarchy (this layout's own `+layout.ts` plus the active page's
	// load), unlike the `data` prop, which would only carry this layout's
	// own data and never a page's title/description/noindex overrides.
	let head = $derived(page.data);
</script>

<svelte:head>
	<title>{head?.title ?? site.defaultTitle}</title>
	<meta name="description" content={head?.description ?? site.defaultDescription} />
	<meta name="robots" content={head?.noindex ? 'noindex, nofollow' : 'index, follow'} />
	<link rel="icon" href={favicon} />
	{#if head?.canonical}
		<link rel="canonical" href={head.canonical} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={head?.title ?? site.defaultTitle} />
	<meta property="og:description" content={head?.description ?? site.defaultDescription} />
	<meta property="og:url" content={head?.canonical ?? site.url} />
	<meta
		property="og:image"
		content={head?.ogImage?.startsWith('http')
			? head.ogImage
			: site.url + (head?.ogImage ?? site.defaultOgImage)}
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={head?.title ?? site.defaultTitle} />
	<meta name="twitter:description" content={head?.description ?? site.defaultDescription} />
	<meta
		name="twitter:image"
		content={head?.ogImage?.startsWith('http')
			? head.ogImage
			: site.url + (head?.ogImage ?? site.defaultOgImage)}
	/>

	<!-- Structured Data -->
	<!-- prettier-ignore -->
	<script type="application/ld+json">
{@html JSON.stringify(jsonLdOrganization())}
	</script>
	<!-- prettier-ignore -->
	<script type="application/ld+json">
{@html JSON.stringify(jsonLdWebSite())}
	</script>
</svelte:head>

<div class="app">
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	:global(html, body) {
		height: 100%;
		margin: 0;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
	}
</style>
