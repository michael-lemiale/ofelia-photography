import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
	return {
		title: 'Selected Work | Ofelia Eme',
		description:
			'A curated selection of photography — fashion, interior, travel and lifestyle — shot on film and digital in Paris and worldwide.',
		ogImage: site.defaultOgImage
	};
};
