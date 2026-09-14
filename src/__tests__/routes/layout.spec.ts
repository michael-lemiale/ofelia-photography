import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, createRawSnippet } from 'svelte';

/**
 * `page.data` (from `$app/state`) is the merged data of the whole route
 * hierarchy, unlike the layout's own `data` prop, which only carries this
 * layout's own load. Mocking `$app/state` here lets us assert the layout
 * head reads page-level overrides rather than only its own defaults.
 */
const mockPage = {
	url: new URL('https://ofeliaemephoto.com/work/events'),
	data: {
		title: 'Events | Ofelia Eme Photography',
		description: 'Event photography, hidden from search.',
		noindex: true,
		canonical: 'https://ofeliaemephoto.com/work/events'
	}
};

vi.mock('$app/state', () => ({ page: mockPage }));

const { default: Layout } = await import('../../routes/+layout.svelte');

function emptySnippet() {
	return createRawSnippet(() => ({
		render: () => '<div style="display:none"></div>',
		setup: () => {}
	}));
}

let host: HTMLElement;
let component: Record<string, unknown> | null = null;

beforeEach(() => {
	host = document.createElement('div');
	document.body.appendChild(host);
});

afterEach(() => {
	if (component) unmount(component);
	component = null;
	host.remove();
});

describe('Root Layout (+layout.svelte)', () => {
	it('should be a valid Svelte component', () => {
		expect(Layout).toBeDefined();
	});

	it('should export as a layout component', () => {
		const componentStr = Layout.toString();
		expect(componentStr).toMatch(/svelte/i);
	});
});

describe('Root Layout head', () => {
	it('renders page-level title, description and noindex from page.data, not just the layout default', () => {
		component = mount(Layout, { target: host, props: { children: emptySnippet() } });

		// jsdom + client-only mount doesn't reflect svelte:head's <title> into
		// document.title, so og:title is the reliable signal that the head
		// picked up page.data rather than the layout's own (title-less) data.
		expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
			mockPage.data.title
		);
		expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
			mockPage.data.description
		);
		expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
			'noindex, nofollow'
		);
	});
});
