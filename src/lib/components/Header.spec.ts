import { describe, it, expect } from 'vitest';
import Header from './Header.svelte';

describe('Header Component', () => {
	it('should be a valid Svelte component', () => {
		expect(Header).toBeDefined();
	});

	it('should export as a Svelte component', () => {
		const componentStr = Header.toString();
		expect(componentStr).toMatch(/svelte/i);
	});
});
