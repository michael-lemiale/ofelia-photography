import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'Events | Ofelia Eme',
		description:
			'Event photography by Ofelia Eme — weddings, gatherings and celebrations captured on film and digital in Paris and worldwide.',
		ogImage: site.defaultOgImage
	};
};
