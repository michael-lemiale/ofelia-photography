import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
  return {
    title: 'Paris Film & Digital Photographer | Ofelia Eme',
    description:
      'Portfolio and services by Paris-based photographer Ofelia Eme — fashion, interior, travel and lifestyle photography shot on film and digital.',
    ogImage: site.defaultOgImage
  };
};
