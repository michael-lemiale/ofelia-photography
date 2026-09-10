import type { PageServerLoad } from './$types';
import { site } from '$lib/siteConfig';
import { loadGallery } from '$lib/server/gallery';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		images: await loadGallery(platform, 'travel'),
		title: `Travel | ${site.name}`,
		description:
			'Travel photography by Ofelia Eme — places and light captured on film and digital around the world.',
		ogImage: site.defaultOgImage
	};
};
