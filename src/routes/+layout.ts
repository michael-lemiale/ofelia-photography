import type { LayoutLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: LayoutLoad = async ({ url }) => {
	const path = url.pathname.replace(/\/$/, '') || '/';
	const canonical = `${site.url}${path === '/' ? '' : path}`;

	return {
		title: site.defaultTitle,
		description: site.defaultDescription,
		ogImage: site.defaultOgImage,
		canonical,
		// Documented default; a page load (e.g. /work/events) overrides this
		// with `noindex: true` to opt out of indexing.
		noindex: false
	};
};
