import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'Fashion | Ofelia Eme',
		description:
			'Fashion photography by Ofelia Eme — editorial, lookbook and campaign work shot on film and digital in Paris and worldwide.',
		ogImage: site.defaultOgImage
	};
};
