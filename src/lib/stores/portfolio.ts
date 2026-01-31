import { writable } from 'svelte/store';

export type PortfolioItem = { path: string; module: any; isPortrait: boolean };

export const portfolioCache = writable<{ elements: PortfolioItem[]; ready: boolean }>({
	elements: [],
	ready: false
});
