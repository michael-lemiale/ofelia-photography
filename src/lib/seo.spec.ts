import { describe, it, expect } from 'vitest';
import { jsonLdOrganization, jsonLdWebSite } from './seo';
import { site } from './siteConfig';

describe('SEO utilities', () => {
	describe('jsonLdOrganization', () => {
		it('should return valid JSON-LD organization schema', () => {
			const schema = jsonLdOrganization();
			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('Organization');
		});

		it('should include site name', () => {
			const schema = jsonLdOrganization();
			expect(schema.name).toBe(site.name);
		});

		it('should include site URL', () => {
			const schema = jsonLdOrganization();
			expect(schema.url).toBe(site.url);
		});

		it('should include social media links', () => {
			const schema = jsonLdOrganization();
			expect(schema.sameAs).toContain(site.social.instagram);
			expect(schema.sameAs).toContain(site.social.tiktok);
			expect(schema.sameAs).toContain(site.social.substack);
		});

		it('should include contact point with email', () => {
			const schema = jsonLdOrganization();
			expect(schema.contactPoint).toBeDefined();
			expect(schema.contactPoint.email).toBe(site.contactEmail);
			expect(schema.contactPoint.contactType).toBe('direct');
		});
	});

	describe('jsonLdWebSite', () => {
		it('should return valid JSON-LD website schema', () => {
			const schema = jsonLdWebSite();
			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('WebSite');
		});

		it('should include site name and URL', () => {
			const schema = jsonLdWebSite();
			expect(schema.name).toBe(site.name);
			expect(schema.url).toBe(site.url);
		});

		it('should include search action potential', () => {
			const schema = jsonLdWebSite();
			expect(schema.potentialAction).toBeDefined();
			expect(schema.potentialAction['@type']).toBe('SearchAction');
			expect(schema.potentialAction.target).toContain(site.url);
		});
	});
});
