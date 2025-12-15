import type { PageLoad } from './$types';
import { site } from '$lib/siteConfig';

export const load: PageLoad = async () => {
  return {
    title: 'Contact | Ofelia Eme',
    description:
      'Get in touch to book a session or inquire about photography projects in Paris and beyond.',
    ogImage: site.defaultOgImage
  };
};
