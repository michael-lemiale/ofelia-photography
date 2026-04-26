import { describe, it, expect } from 'vitest';
import AboutPage from '../../../routes/about/+page.svelte';

describe('About Page (+page.svelte)', () => {
	it('should be a valid component', () => {
		expect(AboutPage).toBeDefined();
	});

	it('should export as a page component', () => {
		expect(typeof AboutPage).toBe('function');
	});
});
