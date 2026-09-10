import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'About | Ofelia Eme',
		description: site.defaultDescription,
		ogImage: site.defaultOgImage
	};
};
