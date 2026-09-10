import { site } from './siteConfig';

export function jsonLdOrganization() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: site.name,
		url: site.url,
		sameAs: [site.social.instagram],
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
		url: site.url
	};
}
