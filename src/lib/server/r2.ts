/**
 * Reads the R2-hosted portfolio manifest. The manifest is written by the
 * `workers/manifest-sync` Worker and carries thumbnail keys plus
 * dimensions for every image, so galleries never need to list the
 * bucket or probe image sizes at request time.
 */

export interface ManifestEntry {
	key: string;
	thumbKey: string;
	width: number;
	height: number;
	isPortrait: boolean;
	filename: string;
	/** The original's etag when its thumbnail was built; a change means it was overwritten. */
	etag?: string;
}

/** Cached manifest (per-isolate; fine for workers) */
let manifestCache: ManifestEntry[] | null = null;
let manifestCacheTime = 0;
const MANIFEST_TTL = 5 * 60 * 1000; // 5 minutes

export async function getManifest(bucket: {
	get: (key: string) => Promise<{ text: () => Promise<string> } | null>;
}): Promise<ManifestEntry[]> {
	const now = Date.now();
	if (manifestCache && now - manifestCacheTime < MANIFEST_TTL) {
		return manifestCache;
	}

	try {
		const obj = await bucket.get('portfolio-manifest.json');
		if (!obj) return [];
		const text = await obj.text();
		manifestCache = JSON.parse(text) as ManifestEntry[];
		manifestCacheTime = now;
		return manifestCache;
	} catch (err) {
		console.error('Failed to load manifest:', err);
		return [];
	}
}

/** Filter manifest entries by R2 key prefix */
export function filterManifestByPrefix(manifest: ManifestEntry[], prefix: string): ManifestEntry[] {
	return manifest.filter((entry) => entry.key.startsWith(prefix));
}
