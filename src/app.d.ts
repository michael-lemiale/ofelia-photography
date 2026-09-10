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

export {};
