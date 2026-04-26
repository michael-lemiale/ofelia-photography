const IMAGE_RE = /\.(jpg|jpeg|png|webp|avif)$/i;

interface R2Object {
	key: string;
}

interface R2ListResult {
	objects?: R2Object[];
	truncated?: boolean;
	cursor?: string;
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
