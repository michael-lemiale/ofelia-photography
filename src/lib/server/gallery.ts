/**
 * Server-side gallery loader.
 *
 * Reads the R2 manifest for a portfolio category and returns a shuffled
 * list of images ready to render. Shuffling happens here, once per
 * request, so the page arrives fully laid out with no client fetch and
 * no layout shift.
 */
import { error } from '@sveltejs/kit';
import { getManifest, filterManifestByPrefix } from '$lib/server/r2';

export type GalleryCategory = 'work' | 'travel' | 'events';

export interface GalleryImage {
	url: string;
	thumbUrl: string;
	width: number;
	height: number;
	key: string;
}

function shuffle<T>(items: T[]): T[] {
	const shuffled = [...items];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export async function loadGallery(
	platform: App.Platform | undefined,
	category: GalleryCategory
): Promise<GalleryImage[]> {
	const bucket = platform?.env?.BUCKET;
	const publicUrl = platform?.env?.R2_PUBLIC_URL;

	if (!bucket || !publicUrl) {
		throw error(500, 'R2 bindings not available. Run via wrangler, not vite dev.');
	}

	const manifest = await getManifest(bucket);
	const entries = filterManifestByPrefix(manifest, `portfolio/${category}/`);

	if (entries.length === 0) {
		console.warn(`No manifest entries for portfolio/${category}/`);
	}

	const images = entries.map((entry) => ({
		url: `${publicUrl}/${entry.key}`,
		thumbUrl: `${publicUrl}/${entry.thumbKey}`,
		width: entry.width,
		height: entry.height,
		key: entry.key
	}));

	return shuffle(images);
}
