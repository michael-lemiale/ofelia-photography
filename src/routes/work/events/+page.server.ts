import type { PageServerLoad } from './$types';
import { site } from '$lib/siteConfig';
import { loadGallery } from '$lib/server/gallery';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		images: await loadGallery(platform, 'events'),
		title: `Events | ${site.name}`,
		description:
			'Event photography by Ofelia Eme — weddings, gatherings and celebrations captured on film and digital in Paris and worldwide.',
		ogImage: site.defaultOgImage,
		noindex: true
	};
};
