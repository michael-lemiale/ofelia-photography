import { json, type RequestHandler } from '@sveltejs/kit';
import { listImages, getImageUrl } from '$lib/r2';

export const GET: RequestHandler = async () => {
	try {
		// List all images in the portfolio folder
		const imageKeys = await listImages('portfolio/');

		// Map to full URLs with metadata
		const images = imageKeys.map((key) => ({
			key,
			url: getImageUrl(key),
			// Extract filename for display
			filename: key.split('/').pop() || key
		}));

		return json({ images });
	} catch (error) {
		console.error('Failed to fetch images from R2:', error);
		return json(
			{ error: 'Failed to load images' },
			{ status: 500 }
		);
	}
};
