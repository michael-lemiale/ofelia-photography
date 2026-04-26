import { json, type RequestHandler } from '@sveltejs/kit';
import { getManifest, filterManifestByPrefix, listAllImages } from '$lib/server/r2';

export const GET: RequestHandler = async ({ platform }) => {
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

		// Try manifest first (has thumb URLs + orientation metadata)
		const manifest = await getManifest(bucket);
		const entries = filterManifestByPrefix(manifest, 'portfolio/');

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

		// Fallback: list bucket directly (no thumbs/orientation)
		const objects = await listAllImages(bucket, 'portfolio/');
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
		console.error('Failed to fetch images from R2:', error);
		return json({ error: 'Failed to load images' }, { status: 500 });
	}
};
