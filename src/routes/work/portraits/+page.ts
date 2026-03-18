import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'Portraits | Ofelia Eme',
		description:
			'Portrait photography by Ofelia Eme — expressive, natural portraits shot on film and digital in Paris and worldwide.',
		ogImage: site.defaultOgImage
	};
};
