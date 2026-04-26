const IMAGE_RE = /\.(jpg|jpeg|png|webp|avif)$/i;

interface R2Object {
	key: string;
}

interface R2ListResult {
	objects?: R2Object[];
	truncated?: boolean;
	cursor?: string;
}

export interface ManifestEntry {
	key: string;
	thumbKey: string;
	width: number;
	height: number;
	isPortrait: boolean;
	filename: string;
}

export async function listAllImages(
	bucket: { list: (opts: object) => Promise<R2ListResult> },
	prefix: string
): Promise<R2Object[]> {
	const all: R2Object[] = [];
	let cursor: string | undefined;

	do {
		const opts: { prefix: string; cursor?: string } = { prefix };
		if (cursor) opts.cursor = cursor;
		const page: R2ListResult = await bucket.list(opts);
		for (const obj of page.objects ?? []) {
			if (IMAGE_RE.test(obj.key)) all.push(obj);
		}
		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);

	return all;
}

/** Cached manifest (per-isolate; fine for workers) */
let manifestCache: ManifestEntry[] | null = null;
let manifestCacheTime = 0;
const MANIFEST_TTL = 5 * 60 * 1000; // 5 minutes

export async function getManifest(
	bucket: { get: (key: string) => Promise<{ text: () => Promise<string> } | null> }
): Promise<ManifestEntry[]> {
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
