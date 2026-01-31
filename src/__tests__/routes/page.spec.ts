import { describe, it, expect } from 'vitest';
import HomePage from '../../routes/+page.svelte';

describe('Home Page (+page.svelte)', () => {
	it('should be a valid component', () => {
		expect(HomePage).toBeDefined();
	});

	it('should export a Svelte component', () => {
		const componentStr = HomePage.toString();
		expect(componentStr).toMatch(/svelte/i);
	});
});
