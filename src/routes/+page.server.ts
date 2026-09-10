import type { PageServerLoad } from './$types';
import { site } from '$lib/siteConfig';
import { loadGallery } from '$lib/server/gallery';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		images: await loadGallery(platform, 'work'),
		title: site.defaultTitle,
		description: site.defaultDescription,
		ogImage: site.defaultOgImage
	};
};
