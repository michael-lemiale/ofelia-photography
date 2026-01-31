import { describe, it, expect } from 'vitest';
import SocialLinks from './SocialLinks.svelte';

describe('SocialLinks Component', () => {
	it('should be a valid Svelte component', () => {
		expect(SocialLinks).toBeDefined();
	});

	it('should export as a Svelte component', () => {
		const componentStr = SocialLinks.toString();
		expect(componentStr).toMatch(/svelte/i);
	});
});
