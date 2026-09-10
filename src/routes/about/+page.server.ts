import type { PageServerLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageServerLoad = async ({ platform }) => {
	const publicUrl = platform?.env?.R2_PUBLIC_URL;
	const portraitUrl =
		site.aboutPortraitKey && publicUrl ? `${publicUrl}/${site.aboutPortraitKey}` : null;

	return {
		title: 'About | Ofelia Eme',
		description: site.defaultDescription,
		ogImage: site.defaultOgImage,
		portraitUrl
	};
};
