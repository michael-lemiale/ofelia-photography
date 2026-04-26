import { json } from '@sveltejs/kit';
import { getManifest, filterManifestByPrefix, listAllImages } from '$lib/server/r2';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Create a GET handler for a category image endpoint.
 * Uses manifest (with thumbs + orientation) when available, falls back to bucket listing.
 */
export function createCategoryHandler(category: string): RequestHandler {
	return async ({ platform }) => {
		try {
			const bucket = (platform as any)?.env?.BUCKET;
			const publicUrl = (platform as any)?.env?.R2_PUBLIC_URL as string | undefined;

			if (!bucket || !publicUrl) {
				return json(
					{
						error:
							'R2 bindings not available. Use Cloudflare Pages or wrangler pages dev, and set R2_PUBLIC_URL.'
					},
					{ status: 500 }
				);
			}

			const prefix = `portfolio/${category}/`;

			// Try manifest first
			const manifest = await getManifest(bucket);
			const entries = filterManifestByPrefix(manifest, prefix);

			if (entries.length > 0) {
				const images = entries.map((entry) => ({
					key: entry.key,
					url: `${publicUrl}/${entry.key}`,
					thumbUrl: `${publicUrl}/${entry.thumbKey}`,
					filename: entry.filename,
					width: entry.width,
					height: entry.height,
					isPortrait: entry.isPortrait
				}));
				return json({ images });
			}

			// Fallback
			const objects = await listAllImages(bucket, prefix);
			const images = objects.map((obj) => ({
				key: obj.key,
				url: `${publicUrl}/${obj.key}`,
				thumbUrl: `${publicUrl}/${obj.key}`,
				filename: obj.key.split('/').pop() || obj.key,
				width: 0,
				height: 0,
				isPortrait: false
			}));

			return json({ images });
		} catch (error) {
			console.error(`Failed to fetch ${category} images from R2:`, error);
			return json({ error: 'Failed to load images' }, { status: 500 });
		}
	};
}
