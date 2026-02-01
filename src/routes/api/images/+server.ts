import { json, type RequestHandler } from '@sveltejs/kit';

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

		// List all images in the portfolio folder
		const list = await bucket.list({ prefix: 'portfolio/' });

		// Map to full URLs with metadata
		const images = (list.objects || [])
			.filter((obj: { key: string }) => /\.(jpg|jpeg|png|webp|avif)$/i.test(obj.key))
			.map((obj: { key: string }) => ({
				key: obj.key,
				url: `${publicUrl}/${obj.key}`,
				// Extract filename for display
				filename: obj.key.split('/').pop() || obj.key
			}));

		return json({
			images,
			debug: {
				listedCount: (list.objects || []).length,
				filteredCount: images.length,
				prefix: 'portfolio/'
			}
		});
	} catch (error) {
		console.error('Failed to fetch images from R2:', error);
		return json(
			{ error: 'Failed to load images' },
			{ status: 500 }
		);
	}
};
