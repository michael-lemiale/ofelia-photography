/**
 * Keeps `portfolio-manifest.json` and the `portfolio-thumbs/` WebP thumbnails
 * in sync with the originals under `portfolio/` in R2.
 *
 * R2 event notifications for `portfolio/` feed a queue that this Worker
 * consumes. A daily cron enqueues one extra message as a backstop for dropped
 * events. Every run ignores message bodies and reconciles a full bucket listing
 * against the manifest, so duplicate, reordered, or missed events all converge
 * on the same result. The queue consumer runs with `max_concurrency = 1`, and
 * the cron goes through the queue rather than reconciling directly, so two
 * runs never write the manifest at the same time.
 *
 * The site reads the manifest through `src/lib/server/r2.ts`.
 */
import type { ManifestEntry } from '../../../src/lib/server/r2';

const SOURCE_PREFIX = 'portfolio/';
const MANIFEST_KEY = 'portfolio-manifest.json';
const IMAGE_RE = /\.(jpg|jpeg|png|webp|avif)$/i;
const THUMB_MAX_WIDTH = 800;
const WEBP_QUALITY = 72;
// Each thumbnail makes two Images calls (transform, info), which count toward
// the free plan's 50 subrequests per invocation; R2 calls fall under the
// separate 1,000 internal limit. Anything past the cap is picked up by a
// follow-up message this run enqueues for itself.
export const MAX_THUMBS_PER_RUN = 20;

interface R2ObjectLike {
	key: string;
	etag: string;
}

/** The subset of the R2 and Images bindings this Worker uses. */
export interface Env {
	BUCKET: {
		list(options: {
			prefix: string;
			cursor?: string;
		}): Promise<{ objects: R2ObjectLike[]; truncated: boolean; cursor?: string }>;
		get(key: string): Promise<{ body: ReadableStream; text(): Promise<string> } | null>;
		put(key: string, value: ArrayBuffer | string, options?: object): Promise<unknown>;
		delete(keys: string[]): Promise<void>;
	};
	IMAGES: {
		input(stream: ReadableStream): {
			transform(options: { width: number }): {
				output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
			};
		};
		info(stream: ReadableStream): Promise<{ width?: number; height?: number }>;
	};
	SYNC_QUEUE: { send(body: unknown): Promise<void> };
}

export function thumbKeyFor(key: string): string {
	return key.replace(/^portfolio\//, 'portfolio-thumbs/').replace(/\.[^.]+$/, '.webp');
}

async function listOriginals(bucket: Env['BUCKET']): Promise<R2ObjectLike[]> {
	const objects: R2ObjectLike[] = [];
	let cursor: string | undefined;
	do {
		const page = await bucket.list({ prefix: SOURCE_PREFIX, cursor });
		objects.push(...page.objects.filter((o) => IMAGE_RE.test(o.key)));
		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);
	return objects;
}

async function readManifest(bucket: Env['BUCKET']): Promise<ManifestEntry[]> {
	const obj = await bucket.get(MANIFEST_KEY);
	return obj ? (JSON.parse(await obj.text()) as ManifestEntry[]) : [];
}

/** Returns null when the original disappeared between listing and reading. */
async function buildThumb(env: Env, original: R2ObjectLike): Promise<ManifestEntry | null> {
	const source = await env.BUCKET.get(original.key);
	if (!source) return null;

	// Images defaults to `fit: scale-down`, so originals narrower than the
	// cap keep their size instead of being upscaled.
	const result = await env.IMAGES.input(source.body)
		.transform({ width: THUMB_MAX_WIDTH })
		.output({ format: 'image/webp', quality: WEBP_QUALITY });
	const bytes = await result.response().arrayBuffer();
	const { width, height } = await env.IMAGES.info(new Response(bytes).body!);
	if (!width || !height) throw new Error(`No dimensions for ${original.key}`);

	const thumbKey = thumbKeyFor(original.key);
	await env.BUCKET.put(thumbKey, bytes, { httpMetadata: { contentType: 'image/webp' } });

	return {
		key: original.key,
		thumbKey,
		width,
		height,
		isPortrait: height > width,
		filename: original.key.split('/').pop() ?? original.key,
		etag: original.etag
	};
}

/**
 * Brings the manifest and thumbnails in line with the bucket. Returns how
 * many originals still need thumbnails after this run's cap, and how many
 * this run built.
 */
export async function reconcile(env: Env): Promise<{ pending: number; built: number }> {
	const originals = await listOriginals(env.BUCKET);
	const manifest = await readManifest(env.BUCKET);
	const existing = new Map(manifest.map((entry) => [entry.key, entry]));

	// A mismatched etag means the original was overwritten. An entry without
	// one predates this Worker and is rebuilt too, since there is no way to
	// tell whether its original changed since the thumbnail was made.
	const stale = originals.filter((o) => existing.get(o.key)?.etag !== o.etag);
	const toBuild = new Set(stale.slice(0, MAX_THUMBS_PER_RUN).map((o) => o.key));

	let changed = false;
	let built = 0;
	const next: ManifestEntry[] = [];
	for (const original of originals) {
		if (toBuild.has(original.key)) {
			try {
				const rebuilt = await buildThumb(env, original);
				if (rebuilt) {
					next.push(rebuilt);
					built++;
				}
				changed = true;
				continue;
			} catch (err) {
				// One unreadable upload must not block the rest; it is retried on
				// the next run. An overwritten original keeps its old thumbnail.
				console.error(`Thumbnail failed for ${original.key}:`, err);
			}
		}
		const entry = existing.get(original.key);
		if (entry) next.push(entry);
	}

	const live = new Set(originals.map((o) => o.key));
	const removed = manifest.filter((entry) => !live.has(entry.key));
	if (removed.length > 0) {
		// Originals that differ only by extension share a thumbnail key, so keep
		// any thumbnail a surviving entry still points at.
		const referenced = new Set(next.map((entry) => entry.thumbKey));
		const orphaned = removed.map((entry) => entry.thumbKey).filter((k) => !referenced.has(k));
		if (orphaned.length > 0) await env.BUCKET.delete(orphaned);
		changed = true;
	}

	if (changed) {
		await env.BUCKET.put(MANIFEST_KEY, JSON.stringify(next, null, 2), {
			httpMetadata: { contentType: 'application/json' }
		});
	}

	return { pending: stale.length - toBuild.size, built };
}

export default {
	async queue(_batch: unknown, env: Env): Promise<void> {
		const { pending, built } = await reconcile(env);
		// A run that built nothing would just retry the same failing files, so
		// leave the remainder to the next R2 event or the daily cron.
		if (pending > 0 && built > 0) await env.SYNC_QUEUE.send({ reason: 'continue' });
	},

	async scheduled(_controller: unknown, env: Env): Promise<void> {
		await env.SYNC_QUEUE.send({ reason: 'cron' });
	}
};
