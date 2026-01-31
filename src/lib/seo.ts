import { site } from './siteConfig';

export function jsonLdOrganization() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: site.name,
		url: site.url,
		sameAs: [site.social.instagram, site.social.tiktok, site.social.substack],
		contactPoint: {
			'@type': 'ContactPoint',
			email: site.contactEmail,
			contactType: 'direct'
		}
	};
}

export function jsonLdWebSite() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: site.name,
		url: site.url,
		potentialAction: {
			'@type': 'SearchAction',
			target: `${site.url}/?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	};
}
