<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { site } from '$lib/siteConfig';
	import { jsonLdOrganization, jsonLdWebSite } from '$lib/seo';

	let { data, children } = $props();
</script>

<svelte:head>
	<title>{data?.title ?? site.defaultTitle}</title>
	<meta name="description" content={data?.description ?? site.defaultDescription} />
	<meta name="robots" content={data?.noindex ? 'noindex, nofollow' : 'index, follow'} />
	<link rel="icon" href={favicon} />
	{#if data?.canonical}
		<link rel="canonical" href={data.canonical} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={data?.title ?? site.defaultTitle} />
	<meta property="og:description" content={data?.description ?? site.defaultDescription} />
	<meta property="og:url" content={data?.canonical ?? site.url} />
	<meta
		property="og:image"
		content={data?.ogImage?.startsWith('http')
			? data.ogImage
			: site.url + (data?.ogImage ?? site.defaultOgImage)}
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data?.title ?? site.defaultTitle} />
	<meta name="twitter:description" content={data?.description ?? site.defaultDescription} />
	<meta
		name="twitter:image"
		content={data?.ogImage?.startsWith('http')
			? data.ogImage
			: site.url + (data?.ogImage ?? site.defaultOgImage)}
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
