import { writable } from 'svelte/store';

export type PortfolioItem = { 
	url: string; 
	key: string; 
	isPortrait: boolean;
	filename: string;
};

export const portfolioCache = writable<{ elements: PortfolioItem[]; ready: boolean }>({
	elements: [],
	ready: false
});
