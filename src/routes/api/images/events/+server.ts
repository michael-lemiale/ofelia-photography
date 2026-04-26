import { json, type RequestHandler } from '@sveltejs/kit';
import { listAllImages } from '$lib/server/r2';

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

		const objects = await listAllImages(bucket, 'portfolio/events/');
		const images = objects.map((obj) => ({
			key: obj.key,
			url: `${publicUrl}/${obj.key}`,
			filename: obj.key.split('/').pop() || obj.key
		}));

		return json({ images });
	} catch (error) {
		console.error('Failed to fetch events images from R2:', error);
		return json({ error: 'Failed to load images' }, { status: 500 });
	}
};
