import type { PortfolioItem } from '$lib/stores/portfolio';

/** Fisher-Yates shuffle algorithm */
export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export type WorkCategory = 'fashion' | 'portraits' | 'spaces' | 'events';

/**
 * Fetch images from the R2 API for a given category,
 * determine orientation, shuffle, and return portfolio items.
 */
export async function loadCategoryImages(category: WorkCategory): Promise<PortfolioItem[]> {
	const res = await fetch(`/api/images/${category}`);
	const data = await res.json();

	if (data.error) {
		console.error(`Failed to load ${category} images:`, data.error);
		return [];
	}

	const loads = (data.images as { url: string; key: string; filename: string }[]).map(
		(image) =>
			new Promise<PortfolioItem>((resolve) => {
				const img = new Image();
				img.onload = () =>
					resolve({
						url: image.url,
						key: image.key,
						filename: image.filename,
						isPortrait: img.height > img.width
					});
				img.onerror = () =>
					resolve({
						url: image.url,
						key: image.key,
						filename: image.filename,
						isPortrait: false
					});
				img.src = image.url;
			})
	);

	const results = await Promise.all(loads);
	return shuffleArray(results);
}
