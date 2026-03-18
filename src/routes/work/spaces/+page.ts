import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'Spaces | Ofelia Eme',
		description:
			'Interior and space photography by Ofelia Eme — architectural, interior and environment work shot on film and digital in Paris and worldwide.',
		ogImage: site.defaultOgImage
	};
};
