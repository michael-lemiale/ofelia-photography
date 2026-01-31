import { describe, it, expect } from 'vitest';
import { site } from './siteConfig';

describe('Site Configuration', () => {
	it('should have required site properties', () => {
		expect(site.name).toBeDefined();
		expect(site.url).toBeDefined();
		expect(site.titleTemplate).toBeDefined();
		expect(site.defaultTitle).toBeDefined();
		expect(site.defaultDescription).toBeDefined();
		expect(site.contactEmail).toBeDefined();
	});

	it('should have valid site name', () => {
		expect(site.name).toBe('Ofelia Eme Photography');
	});

	it('should have valid site URL', () => {
		expect(site.url).toMatch(/^https:\/\//);
		expect(site.url).toBe('https://ofeliaemephoto.com');
	});

	it('should have social media links', () => {
		expect(site.social.instagram).toBeDefined();
		expect(site.social.tiktok).toBeDefined();
		expect(site.social.substack).toBeDefined();
		expect(site.social.instagram).toMatch(/^https:\/\/www\.instagram\.com\//);
		expect(site.social.tiktok).toMatch(/^https:\/\/www\.tiktok\.com\//);
	});

	it('should have valid contact email', () => {
		expect(site.contactEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
	});

	it('should have default OG image', () => {
		expect(site.defaultOgImage).toBeDefined();
		expect(site.defaultOgImage).toMatch(/\.(svg|png|jpg|jpeg)$/);
	});

	it('should format title correctly with template', () => {
		const testTitle = 'Portfolio';
		const formatted = site.titleTemplate.replace('%s', testTitle);
		expect(formatted).toBe(`${testTitle} | ofelia eme`);
	});
});
