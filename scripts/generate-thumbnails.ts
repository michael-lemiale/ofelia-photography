#!/usr/bin/env bun

/**
 * Generate optimized thumbnails and an image manifest for R2-hosted images.
 *
 * This script:
 *   1. Downloads originals from R2
 *   2. Resizes to max 1100px wide as WebP (quality 80)
 *   3. Uploads thumbnails to portfolio-thumbs/ in R2
 *   4. Uploads a manifest.json with orientation metadata
 *
 * Usage:
 *   bun scripts/generate-thumbnails.ts [options]
 *
 * Options:
 *   --dry-run     Show what would be generated without uploading
 *   --force       Re-generate even if thumbnail already exists
 *   --prefix <p>  Source prefix in R2 (default: portfolio/)
 */

import {
	S3Client,
	ListObjectsV2Command,
	GetObjectCommand,
	PutObjectCommand,
	HeadObjectCommand
} from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import sharp from 'sharp';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
	console.error('Missing required environment variables:');
	console.error('  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
	process.exit(1);
}

const r2 = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY
	}
});

const IMAGE_RE = /\.(jpg|jpeg|png|webp|avif)$/i;
const THUMB_MAX_WIDTH = 800;
const WEBP_QUALITY = 72;

interface ManifestEntry {
	key: string;
	thumbKey: string;
	width: number;
	height: number;
	isPortrait: boolean;
	filename: string;
}

async function listAllKeys(prefix: string): Promise<string[]> {
	const keys: string[] = [];
	let continuationToken: string | undefined;

	do {
		const res = await r2.send(
			new ListObjectsV2Command({
				Bucket: R2_BUCKET_NAME,
				Prefix: prefix,
				ContinuationToken: continuationToken
			})
		);
		for (const obj of res.Contents ?? []) {
			if (obj.Key && IMAGE_RE.test(obj.Key)) {
				keys.push(obj.Key);
			}
		}
		continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
	} while (continuationToken);

	return keys;
}

async function thumbExists(thumbKey: string): Promise<boolean> {
	try {
		await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: thumbKey }));
		return true;
	} catch {
		return false;
	}
}

function getThumbKey(originalKey: string): string {
	// portfolio/fashion/img.jpg -> portfolio-thumbs/fashion/img.webp
	const withoutExt = originalKey.replace(/\.[^.]+$/, '');
	return withoutExt.replace(/^portfolio\//, 'portfolio-thumbs/') + '.webp';
}

async function downloadObject(key: string): Promise<Buffer> {
	const res = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
	const chunks: Uint8Array[] = [];
	const stream = res.Body as AsyncIterable<Uint8Array>;
	for await (const chunk of stream) {
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

async function processImage(
	key: string,
	dryRun: boolean,
	force: boolean
): Promise<ManifestEntry | null> {
	const thumbKey = getThumbKey(key);

	// Check if thumb already exists
	if (!force && (await thumbExists(thumbKey))) {
		// Still need metadata — download thumb to get dimensions
		const thumbBuf = await downloadObject(thumbKey);
		const meta = await sharp(thumbBuf).metadata();
		const w = meta.width ?? 0;
		const h = meta.height ?? 0;
		console.log(`  [SKIP] ${key} -> ${thumbKey} (already exists, ${w}x${h})`);
		return {
			key,
			thumbKey,
			width: w,
			height: h,
			isPortrait: h > w,
			filename: key.split('/').pop() || key
		};
	}

	// Download original
	const buf = await downloadObject(key);
	const image = sharp(buf);
	const meta = await image.metadata();
	const origW = meta.width ?? 0;
	const origH = meta.height ?? 0;

	// Resize (only if wider than max)
	let pipeline = image;
	if (origW > THUMB_MAX_WIDTH) {
		pipeline = pipeline.resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true });
	}

	const webpBuf = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
	const thumbMeta = await sharp(webpBuf).metadata();
	const tw = thumbMeta.width ?? 0;
	const th = thumbMeta.height ?? 0;

	if (dryRun) {
		console.log(
			`  [DRY RUN] ${key} (${origW}x${origH}) -> ${thumbKey} (${tw}x${th}, ${(webpBuf.length / 1024).toFixed(0)}KB)`
		);
	} else {
		await r2.send(
			new PutObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: thumbKey,
				Body: webpBuf,
				ContentType: 'image/webp'
			})
		);
		console.log(
			`  ${key} (${origW}x${origH}) -> ${thumbKey} (${tw}x${th}, ${(webpBuf.length / 1024).toFixed(0)}KB)`
		);
	}

	return {
		key,
		thumbKey,
		width: tw,
		height: th,
		isPortrait: th > tw,
		filename: key.split('/').pop() || key
	};
}

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const force = args.includes('--force');
	const prefixIdx = args.indexOf('--prefix');
	const prefix = prefixIdx !== -1 && args[prefixIdx + 1] ? args[prefixIdx + 1] : 'portfolio/';

	console.log('Thumbnail Generator');
	console.log('-------------------');
	console.log(`Source prefix: ${prefix}`);
	console.log(`Dry run: ${dryRun}`);
	console.log(`Force regenerate: ${force}`);
	console.log('');

	const keys = await listAllKeys(prefix);
	console.log(`Found ${keys.length} images`);
	console.log('');

	const manifest: ManifestEntry[] = [];
	let processed = 0;
	let failed = 0;

	for (const key of keys) {
		try {
			const entry = await processImage(key, dryRun, force);
			if (entry) {
				manifest.push(entry);
				processed++;
			}
		} catch (err) {
			console.error(`  [FAIL] ${key}:`, err);
			failed++;
		}
	}

	// Upload manifest
	const manifestKey = 'portfolio-manifest.json';
	const manifestJson = JSON.stringify(manifest, null, 2);

	if (dryRun) {
		console.log(`\n[DRY RUN] Would upload manifest (${manifest.length} entries) to ${manifestKey}`);
	} else {
		await r2.send(
			new PutObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: manifestKey,
				Body: manifestJson,
				ContentType: 'application/json'
			})
		);
		console.log(`\nUploaded manifest (${manifest.length} entries) to ${manifestKey}`);
	}

	console.log('\n-------------------');
	console.log(`Processed: ${processed}`);
	console.log(`Failed: ${failed}`);
	console.log(`Manifest entries: ${manifest.length}`);
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
