import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Gallery from './Gallery.svelte';
import WorkOverview from '../../routes/work/+page.svelte';
import { portfolioCaches } from '$lib/stores/portfolio';

/**
 * Guards the image tier each /work surface requests. The 800px thumbnails exist
 * to keep a whole category decodable on mobile; using them on desktop, where
 * tiles render up to ~1340px, visibly upscales the photography.
 */

const PORTRAIT = {
	key: 'portfolio/fashion/a.webp',
	filename: 'a.webp',
	url: 'https://img.test/portfolio/fashion/a.webp',
	thumbUrl: 'https://img.test/portfolio-thumbs/fashion/a.webp',
	width: 800,
	height: 1206,
	isPortrait: true
};
const LANDSCAPE = {
	key: 'portfolio/fashion/b.webp',
	filename: 'b.webp',
	url: 'https://img.test/portfolio/fashion/b.webp',
	thumbUrl: 'https://img.test/portfolio-thumbs/fashion/b.webp',
	width: 800,
	height: 533,
	isPortrait: false
};

let host: HTMLElement;
let component: Record<string, unknown> | null = null;

function stubApi(images: unknown[]) {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response(JSON.stringify({ images })))
	);
}

/** Let onMount's fetch chain settle and Svelte flush the resulting render. */
async function settle() {
	for (let i = 0; i < 5; i++) await Promise.resolve();
	await new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
	// jsdom has no Web Animations API; svelte transitions call it on mount.
	Element.prototype.animate ??= (() => ({
		cancel() {},
		finished: Promise.resolve(),
		startTime: 0,
		currentTime: 0
	})) as unknown as Element['animate'];

	for (const cache of Object.values(portfolioCaches)) {
		cache.set({ elements: [], ready: false });
	}
	host = document.createElement('div');
	document.body.appendChild(host);
});

afterEach(() => {
	if (component) unmount(component);
	component = null;
	host.remove();
	vi.unstubAllGlobals();
});

describe('Gallery image tier', () => {
	it('serves the original above the single-column breakpoint and the thumb below it', async () => {
		stubApi([PORTRAIT, LANDSCAPE]);
		component = mount(Gallery, { target: host, props: { category: 'fashion' } });
		await settle();

		const pictures = [...host.querySelectorAll('picture')];
		expect(pictures).toHaveLength(2);

		for (const picture of pictures) {
			const source = picture.querySelector('source');
			const img = picture.querySelector('img');

			// Desktop candidate must be the original, never the thumb tier.
			expect(source?.getAttribute('media')).toBe('(min-width: 769px)');
			expect(source?.getAttribute('srcset')).toMatch(/\/portfolio\//);
			expect(source?.getAttribute('srcset')).not.toMatch(/portfolio-thumbs/);

			// Mobile fallback stays on the thumb: a full category of originals
			// exhausts WebKit's renderer memory budget.
			expect(img?.getAttribute('src')).toMatch(/portfolio-thumbs/);
			expect(img?.getAttribute('loading')).toBe('lazy');
		}
	});
});

describe('Work overview category tiles', () => {
	it('serves originals, not thumbs', async () => {
		stubApi([PORTRAIT]);
		component = mount(WorkOverview, { target: host });
		await settle();

		const imgs = [...host.querySelectorAll('.image-wrapper img')];
		expect(imgs.length).toBeGreaterThan(0);
		for (const img of imgs) {
			expect(img.getAttribute('src')).toBe(PORTRAIT.url);
		}
	});
});
