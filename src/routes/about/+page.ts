import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'About | Ofelia Eme',
		description:
			'Learn about Ofelia Eme — Paris-based photographer specializing in fashion, travel and lifestyle photography.',
		ogImage: site.defaultOgImage
	};
};
