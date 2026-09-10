// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				BUCKET: {
					get: (key: string) => Promise<{ text: () => Promise<string> } | null>;
				};
				R2_PUBLIC_URL?: string;
			};
		}
	}
}

// Vite's `?raw` import suffix, used in tests that need a component's source
// text (e.g. to regression-test a CSS rule jsdom can't evaluate).
declare module '*.svelte?raw' {
	const content: string;
	export default content;
}

export {};
