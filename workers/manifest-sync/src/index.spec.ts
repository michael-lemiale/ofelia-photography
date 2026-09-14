import { describe, it, expect, vi } from 'vitest';
import worker, { reconcile, thumbKeyFor, MAX_THUMBS_PER_RUN, type Env } from './index';
import type { ManifestEntry } from '../../../src/lib/server/r2';

type Stored = { value: string; etag: string };

function makeEnv(objects: Record<string, string>, manifest?: ManifestEntry[]) {
	const store = new Map<string, Stored>(
		Object.entries(objects).map(([key, etag]) => [key, { value: 'img', etag }])
	);
	if (manifest) {
		store.set('portfolio-manifest.json', { value: JSON.stringify(manifest), etag: 'm' });
	}

	const bucket: Env['BUCKET'] = {
		list: async ({ prefix }) => ({
			objects: [...store.entries()]
				.filter(([key]) => key.startsWith(prefix))
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([key, { etag }]) => ({ key, etag })),
			truncated: false
		}),
		get: async (key) => {
			const obj = store.get(key);
			if (!obj) return null;
			return { body: new Response(obj.value).body!, text: async () => obj.value };
		},
		put: vi.fn(async (key: string, value: ArrayBuffer | string) => {
			store.set(key, { value: typeof value === 'string' ? value : 'thumb', etag: 'new' });
		}),
		delete: vi.fn(async (keys: string[]) => {
			keys.forEach((key) => store.delete(key));
		})
	};

	const images: Env['IMAGES'] = {
		input: vi.fn(() => ({
			transform: () => ({
				output: async () => ({ response: () => new Response('webp') })
			})
		})),
		info: async () => ({ width: 800, height: 1200 })
	};

	const env: Env = { BUCKET: bucket, IMAGES: images, SYNC_QUEUE: { send: vi.fn(async () => {}) } };
	const manifestOf = () =>
		JSON.parse(store.get('portfolio-manifest.json')?.value ?? '[]') as ManifestEntry[];
	return { env, store, manifestOf };
}

function entry(key: string, etag?: string): ManifestEntry {
	return {
		key,
		thumbKey: thumbKeyFor(key),
		width: 800,
		height: 600,
		isPortrait: false,
		filename: key.split('/').pop()!,
		etag
	};
}

describe('thumbKeyFor', () => {
	it('moves the key under portfolio-thumbs and swaps the extension to webp', () => {
		expect(thumbKeyFor('portfolio/work/a.b.JPG')).toBe('portfolio-thumbs/work/a.b.webp');
	});
});

describe('reconcile', () => {
	it('builds a thumbnail and manifest entry for a new original', async () => {
		const { env, store, manifestOf } = makeEnv({ 'portfolio/work/a.jpg': 'e1' }, []);

		await reconcile(env);

		expect(store.has('portfolio-thumbs/work/a.webp')).toBe(true);
		expect(manifestOf()).toEqual([
			{
				key: 'portfolio/work/a.jpg',
				thumbKey: 'portfolio-thumbs/work/a.webp',
				width: 800,
				height: 1200,
				isPortrait: true,
				filename: 'a.jpg',
				etag: 'e1'
			}
		]);
	});

	it('drops entries and thumbnails for deleted originals', async () => {
		const { env, manifestOf } = makeEnv({ 'portfolio/work/a.jpg': 'e1' }, [
			entry('portfolio/work/a.jpg', 'e1'),
			entry('portfolio/work/gone.jpg', 'e2')
		]);

		await reconcile(env);

		expect(env.BUCKET.delete).toHaveBeenCalledWith(['portfolio-thumbs/work/gone.webp']);
		expect(manifestOf().map((e) => e.key)).toEqual(['portfolio/work/a.jpg']);
	});

	it('rebuilds the thumbnail when an original is overwritten', async () => {
		const { env, manifestOf } = makeEnv({ 'portfolio/work/a.jpg': 'e2' }, [
			entry('portfolio/work/a.jpg', 'e1')
		]);

		await reconcile(env);

		expect(env.IMAGES.input).toHaveBeenCalledTimes(1);
		expect(manifestOf()[0]).toMatchObject({ etag: 'e2', height: 1200 });
	});

	it('rebuilds entries that predate etags', async () => {
		const { env, manifestOf } = makeEnv({ 'portfolio/work/a.jpg': 'e1' }, [
			entry('portfolio/work/a.jpg')
		]);

		await reconcile(env);

		expect(env.IMAGES.input).toHaveBeenCalledTimes(1);
		expect(manifestOf()[0]).toMatchObject({ etag: 'e1', height: 1200 });
	});

	it('keeps a thumbnail still shared by an original with another extension', async () => {
		const { env, store, manifestOf } = makeEnv({ 'portfolio/work/a.png': 'e2' }, [
			entry('portfolio/work/a.jpg', 'e1')
		]);

		await reconcile(env);

		expect(env.BUCKET.delete).not.toHaveBeenCalled();
		expect(store.has('portfolio-thumbs/work/a.webp')).toBe(true);
		expect(manifestOf().map((e) => e.key)).toEqual(['portfolio/work/a.png']);
	});

	it('does not rewrite the manifest when nothing changed', async () => {
		const { env } = makeEnv({ 'portfolio/work/a.jpg': 'e1' }, [
			entry('portfolio/work/a.jpg', 'e1')
		]);

		await reconcile(env);

		expect(env.BUCKET.put).not.toHaveBeenCalled();
	});

	it('ignores non-image keys and objects outside portfolio/', async () => {
		const { env } = makeEnv({ 'portfolio/work/notes.txt': 'e1', 'other/a.jpg': 'e2' }, []);

		await reconcile(env);

		expect(env.IMAGES.input).not.toHaveBeenCalled();
	});

	it('caps thumbnails per run and reports the rest as pending', async () => {
		const originals = Object.fromEntries(
			Array.from({ length: MAX_THUMBS_PER_RUN + 3 }, (_, i) => [
				`portfolio/work/${String(i).padStart(4, '0')}.jpg`,
				`e${i}`
			])
		);
		const { env, manifestOf } = makeEnv(originals, []);

		const { pending } = await reconcile(env);

		expect(pending).toBe(3);
		expect(manifestOf()).toHaveLength(MAX_THUMBS_PER_RUN);
	});

	it('skips an image that fails to transform without blocking the others', async () => {
		const { env, manifestOf } = makeEnv(
			{ 'portfolio/work/bad.jpg': 'e1', 'portfolio/work/good.jpg': 'e2' },
			[]
		);
		const input = env.IMAGES.input;
		env.IMAGES.input = vi.fn((stream) => {
			if (vi.mocked(env.IMAGES.input).mock.calls.length === 1) throw new Error('corrupt');
			return input(stream);
		});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await reconcile(env);

		expect(manifestOf().map((e) => e.key)).toEqual(['portfolio/work/good.jpg']);
	});
});

describe('worker handlers', () => {
	it('enqueues a follow-up run while thumbnails are pending', async () => {
		const originals = Object.fromEntries(
			Array.from({ length: MAX_THUMBS_PER_RUN + 1 }, (_, i) => [`portfolio/work/${i}.jpg`, 'e'])
		);
		const { env } = makeEnv(originals, []);

		await worker.queue({}, env);

		expect(env.SYNC_QUEUE.send).toHaveBeenCalledTimes(1);
	});

	it('does not re-enqueue when a capped run built nothing', async () => {
		const originals = Object.fromEntries(
			Array.from({ length: MAX_THUMBS_PER_RUN + 1 }, (_, i) => [`portfolio/work/${i}.jpg`, 'e'])
		);
		const { env } = makeEnv(originals, []);
		env.IMAGES.input = vi.fn(() => {
			throw new Error('corrupt');
		});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await worker.queue({}, env);

		expect(env.SYNC_QUEUE.send).not.toHaveBeenCalled();
	});

	it('routes the cron through the queue instead of reconciling directly', async () => {
		const { env } = makeEnv({ 'portfolio/work/a.jpg': 'e1' }, []);

		await worker.scheduled({}, env);

		expect(env.SYNC_QUEUE.send).toHaveBeenCalledWith({ reason: 'cron' });
		expect(env.IMAGES.input).not.toHaveBeenCalled();
	});
});
