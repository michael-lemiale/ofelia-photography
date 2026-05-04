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
 * Fetch images from the R2 API for a given category.
 * Uses server-provided orientation metadata from the manifest,
 * falling back to client-side detection only when dimensions are missing.
 */
export async function loadCategoryImages(category: WorkCategory): Promise<PortfolioItem[]> {
	const res = await fetch(`/api/images/${category}`);
	const data = await res.json();

	if (data.error) {
		console.error(`Failed to load ${category} images:`, data.error);
		return [];
	}

	const items: PortfolioItem[] = [];
	const needsDetection: { image: any; index: number }[] = [];

	for (const image of data.images as {
		url: string;
		key: string;
		filename: string;
		thumbUrl?: string;
		width?: number;
		height?: number;
		isPortrait?: boolean;
	}[]) {
		if (image.width && image.height) {
			// Use server-provided orientation — no download needed
			items.push({
				url: image.url,
				thumbUrl: image.thumbUrl || image.url,
				key: image.key,
				filename: image.filename,
				isPortrait: image.isPortrait ?? image.height > image.width
			});
		} else {
			// Fallback: will need client-side detection
			const idx = items.length;
			items.push({
				url: image.url,
				thumbUrl: image.thumbUrl || image.url,
				key: image.key,
				filename: image.filename,
				isPortrait: false // placeholder
			});
			needsDetection.push({ image, index: idx });
		}
	}

	// Client-side fallback for images without manifest data
	if (needsDetection.length > 0) {
		await Promise.all(
			needsDetection.map(
				({ image, index }) =>
					new Promise<void>((resolve) => {
						const img = new Image();
						img.onload = () => {
							items[index] = { ...items[index], isPortrait: img.height > img.width };
							resolve();
						};
						img.onerror = () => resolve();
						img.src = image.thumbUrl || image.url;
					})
			)
		);
	}

	return shuffleArray(items);
}
