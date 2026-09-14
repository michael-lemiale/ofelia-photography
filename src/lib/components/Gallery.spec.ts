import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { mount, unmount } from 'svelte';
import Gallery from './Gallery.svelte';
import type { GalleryImage } from '$lib/server/gallery';

/**
 * Guards the justified-row layout math: consecutive images pair into rows,
 * an odd trailing image renders alone, and each item's flex-grow equals its
 * own aspect ratio (the mechanism that makes both images in a row share one
 * height with no JS measuring). Also guards the image tier each row
 * requests — the 800px thumb exists to keep mobile Safari's decode budget
 * in check, and must not leak onto the desktop candidate.
 */

function image(key: string, width: number, height: number): GalleryImage {
	return {
		key,
		url: `https://img.test/portfolio/work/${key}`,
		thumbUrl: `https://img.test/portfolio-thumbs/work/${key}`,
		width,
		height
	};
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

describe('Gallery row pairing', () => {
	it('pairs consecutive images into two-item rows', () => {
		const images = [image('a', 4, 3), image('b', 1, 1), image('c', 3, 2), image('d', 16, 9)];
		component = mount(Gallery, { target: host, props: { images } });

		const rows = [...host.querySelectorAll('.row')];
		expect(rows).toHaveLength(2);
		for (const row of rows) {
			expect(row.querySelectorAll('.item')).toHaveLength(2);
		}
	});

	it('renders an odd trailing image alone in its own row', () => {
		const images = [image('a', 4, 3), image('b', 1, 1), image('c', 3, 2)];
		component = mount(Gallery, { target: host, props: { images } });

		const rows = [...host.querySelectorAll('.row')];
		expect(rows).toHaveLength(2);
		expect(rows[0].querySelectorAll('.item')).toHaveLength(2);
		expect(rows[1].querySelectorAll('.item')).toHaveLength(1);
	});
});

describe('Gallery empty state', () => {
	it('shows a placeholder line and no rows when there are no images', () => {
		component = mount(Gallery, { target: host, props: { images: [] } });

		expect(host.querySelector('.empty')?.textContent).toBe('No images yet.');
		expect(host.querySelectorAll('.row')).toHaveLength(0);
	});
});

describe('Gallery justified sizing', () => {
	it('sets flex-grow equal to the image aspect ratio', () => {
		const images = [image('a', 4, 3), image('b', 16, 9)];
		component = mount(Gallery, { target: host, props: { images } });

		const items = [...host.querySelectorAll<HTMLElement>('.item')];
		expect(items).toHaveLength(2);
		expect(items[0].style.flexGrow).toBe(String(4 / 3));
		expect(items[1].style.flexGrow).toBe(String(16 / 9));
	});

	it('sets aspect-ratio to the image dimensions', () => {
		const images = [image('a', 4, 3)];
		component = mount(Gallery, { target: host, props: { images } });

		const item = host.querySelector<HTMLElement>('.item');
		expect(item?.getAttribute('style')).toContain('aspect-ratio: 4 / 3');
	});
});

describe('Gallery image tier', () => {
	it('serves the original above the single-column breakpoint and the thumb below it', () => {
		const images = [image('a', 4, 3), image('b', 1, 1)];
		component = mount(Gallery, { target: host, props: { images } });

		const pictures = [...host.querySelectorAll('picture')];
		expect(pictures).toHaveLength(2);

		for (const picture of pictures) {
			const source = picture.querySelector('source');
			const img = picture.querySelector('img');

			expect(source?.getAttribute('media')).toBe('(min-width: 769px)');
			expect(source?.getAttribute('srcset')).toMatch(/\/portfolio\//);
			expect(source?.getAttribute('srcset')).not.toMatch(/portfolio-thumbs/);

			expect(img?.getAttribute('src')).toMatch(/portfolio-thumbs/);
			expect(img?.getAttribute('loading')).toBe('lazy');
		}
	});
});
