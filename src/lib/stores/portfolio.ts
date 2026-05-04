import { writable } from 'svelte/store';
import type { WorkCategory } from '$lib/imageLoader';

export type PortfolioItem = {
	url: string;
	thumbUrl: string;
	key: string;
	isPortrait: boolean;
	filename: string;
};

export type CategoryCache = { elements: PortfolioItem[]; ready: boolean };

/** Per-category caches keyed by category name */
export const portfolioCaches: Record<WorkCategory, ReturnType<typeof writable<CategoryCache>>> = {
	fashion: writable<CategoryCache>({ elements: [], ready: false }),
	portraits: writable<CategoryCache>({ elements: [], ready: false }),
	spaces: writable<CategoryCache>({ elements: [], ready: false }),
	events: writable<CategoryCache>({ elements: [], ready: false })
};

/** Legacy combined cache (kept for backwards compat if needed) */
export const portfolioCache = writable<CategoryCache>({
	elements: [],
	ready: false
});
