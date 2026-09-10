import { describe, it, expect } from 'vitest';
import { loadGallery } from './gallery';

const MANIFEST = [
	{
		key: 'portfolio/work/a.jpg',
		thumbKey: 'portfolio-thumbs/work/a.webp',
		width: 800,
		height: 600,
		isPortrait: false,
		filename: 'a.jpg'
	},
	{
		key: 'portfolio/travel/b.jpg',
		thumbKey: 'portfolio-thumbs/travel/b.webp',
		width: 600,
		height: 800,
		isPortrait: true,
		filename: 'b.jpg'
	}
];

function platformWithManifest() {
	return {
		env: {
			BUCKET: {
				get: async () => ({ text: async () => JSON.stringify(MANIFEST) })
			},
			R2_PUBLIC_URL: 'https://img.test'
		}
	} as unknown as App.Platform;
}

describe('loadGallery', () => {
	it('filters the manifest by category prefix and maps to gallery images', async () => {
		const images = await loadGallery(platformWithManifest(), 'work');

		expect(images).toHaveLength(1);
		expect(images[0]).toEqual({
			url: 'https://img.test/portfolio/work/a.jpg',
			thumbUrl: 'https://img.test/portfolio-thumbs/work/a.webp',
			width: 800,
			height: 600,
			key: 'portfolio/work/a.jpg'
		});
	});

	it('returns an empty list when nothing matches the category', async () => {
		const images = await loadGallery(platformWithManifest(), 'events');
		expect(images).toHaveLength(0);
	});

	it('throws a 500 when the R2 bucket binding is missing', async () => {
		await expect(loadGallery(undefined, 'work')).rejects.toMatchObject({ status: 500 });
	});

	it('throws a 500 when the public URL is missing', async () => {
		const platform = { env: { BUCKET: platformWithManifest().env!.BUCKET } } as App.Platform;
		await expect(loadGallery(platform, 'work')).rejects.toMatchObject({ status: 500 });
	});
});
