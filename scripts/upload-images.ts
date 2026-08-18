#!/usr/bin/env bun

/**
 * Upload images from a local directory to Cloudflare R2
 *
 * Usage:
 *   bun scripts/upload-images.ts <source-directory> [options]
 *
 * Options:
 *   --prefix <prefix>    Prefix for uploaded files (e.g., 'portfolio/')
 *   --dry-run           Show what would be uploaded without uploading
 *
 * Example:
 *   bun scripts/upload-images.ts ./local-images --prefix portfolio/
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { createHash } from 'crypto';

// Load environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
	console.error('❌ Missing required environment variables:');
	console.error('   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
	console.error('   Please configure these in your .env file');
	process.exit(1);
}

const r2Client = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY
	}
});

// Content type mapping
const CONTENT_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.gif': 'image/gif'
};

interface UploadOptions {
	prefix?: string;
	dryRun?: boolean;
}

async function getImageFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			// Recursively get files from subdirectories
			const subFiles = await getImageFiles(fullPath);
			files.push(...subFiles);
		} else if (entry.isFile()) {
			const ext = extname(entry.name).toLowerCase();
			if (CONTENT_TYPES[ext]) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

function getContentType(filePath: string): string {
	const ext = extname(filePath).toLowerCase();
	return CONTENT_TYPES[ext] || 'application/octet-stream';
}

async function uploadFile(
	filePath: string,
	key: string,
	dryRun: boolean
): Promise<{ success: boolean; size: number }> {
	const fileBuffer = await readFile(filePath);
	const stats = await stat(filePath);
	const contentType = getContentType(filePath);

	// Generate ETag (MD5 hash)
	const hash = createHash('md5').update(fileBuffer).digest('hex');

	if (dryRun) {
		console.log(`  [DRY RUN] Would upload: ${key}`);
		console.log(`    Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
		console.log(`    Type: ${contentType}`);
		console.log(`    MD5: ${hash}`);
		return { success: true, size: stats.size };
	}

	const command = new PutObjectCommand({
		Bucket: R2_BUCKET_NAME,
		Key: key,
		Body: fileBuffer,
		ContentType: contentType,
		Metadata: {
			'uploaded-at': new Date().toISOString(),
			'original-name': basename(filePath)
		}
	});

	await r2Client.send(command);
	return { success: true, size: stats.size };
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help')) {
		console.log('Usage: bun scripts/upload-images.ts <source-directory> [options]');
		console.log('');
		console.log('Options:');
		console.log('  --prefix <prefix>    Prefix for uploaded files (e.g., "portfolio/")');
		console.log('  --dry-run           Show what would be uploaded without uploading');
		console.log('');
		console.log('Example:');
		console.log('  bun scripts/upload-images.ts ./local-images --prefix portfolio/');
		process.exit(0);
	}

	const sourceDir = args[0];
	const options: UploadOptions = {
		prefix: '',
		dryRun: false
	};

	// Parse options
	for (let i = 1; i < args.length; i++) {
		if (args[i] === '--prefix' && args[i + 1]) {
			options.prefix = args[i + 1];
			i++;
		} else if (args[i] === '--dry-run') {
			options.dryRun = true;
		}
	}

	console.log('🚀 Cloudflare R2 Image Upload');
	console.log('─────────────────────────────');
	console.log(`📁 Source directory: ${sourceDir}`);
	console.log(`🪣 Bucket: ${R2_BUCKET_NAME}`);
	console.log(`📝 Prefix: ${options.prefix || '(none)'}`);
	console.log(`🧪 Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
	console.log('');

	// Get all image files
	console.log('🔍 Scanning for images...');
	const imageFiles = await getImageFiles(sourceDir);
	console.log(`   Found ${imageFiles.length} images`);
	console.log('');

	if (imageFiles.length === 0) {
		console.log('❌ No images found. Exiting.');
		process.exit(0);
	}

	// Upload files
	let uploaded = 0;
	let failed = 0;
	let totalSize = 0;

	console.log('📤 Uploading images...');
	for (const filePath of imageFiles) {
		const relativePath = filePath.replace(sourceDir, '').replace(/^\//, '');
		const key = options.prefix ? `${options.prefix}${relativePath}` : relativePath;

		try {
			const result = await uploadFile(filePath, key, options.dryRun || false);
			if (result.success) {
				uploaded++;
				totalSize += result.size;
				if (!options.dryRun) {
					console.log(`  ✅ ${key} (${(result.size / 1024 / 1024).toFixed(2)} MB)`);
				}
			}
		} catch (error) {
			failed++;
			console.error(`  ❌ Failed to upload ${key}:`, error);
		}
	}

	console.log('');
	console.log('─────────────────────────────');
	console.log('📊 Summary');
	console.log(`   ${options.dryRun ? 'Would upload' : 'Uploaded'}: ${uploaded} images`);
	console.log(`   Failed: ${failed}`);
	console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

	if (options.dryRun) {
		console.log('');
		console.log('💡 This was a dry run. Remove --dry-run to actually upload.');
	}
}

main().catch((error) => {
	console.error('❌ Upload failed:', error);
	process.exit(1);
});
