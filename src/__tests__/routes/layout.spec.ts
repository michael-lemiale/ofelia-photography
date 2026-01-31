import { describe, it, expect } from 'vitest';
import Layout from '../../routes/+layout.svelte';

describe('Root Layout (+layout.svelte)', () => {
	it('should be a valid Svelte component', () => {
		expect(Layout).toBeDefined();
	});

	it('should export as a layout component', () => {
		const componentStr = Layout.toString();
		expect(componentStr).toMatch(/svelte/i);
	});
});
