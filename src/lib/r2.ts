import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

// Get R2 configuration from environment variables
function getR2Config() {
	const config = {
		accountId: env.R2_ACCOUNT_ID || '',
		accessKeyId: env.R2_ACCESS_KEY_ID || '',
		secretAccessKey: env.R2_SECRET_ACCESS_KEY || '',
		bucketName: env.R2_BUCKET_NAME || '',
		publicUrl: env.R2_PUBLIC_URL || ''
	};

	const missing: string[] = [];
	if (!config.accountId) missing.push('R2_ACCOUNT_ID');
	if (!config.accessKeyId) missing.push('R2_ACCESS_KEY_ID');
	if (!config.secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
	if (!config.bucketName) missing.push('R2_BUCKET_NAME');
	if (!config.publicUrl) missing.push('R2_PUBLIC_URL');

	if (missing.length > 0) {
		throw new Error(
			`R2 configuration incomplete. Missing environment variables: ${missing.join(', ')}.\n` +
			`Please copy .env.example to .env and configure your Cloudflare R2 credentials.\n` +
			`See R2_SETUP.md for instructions.`
		);
	}

	return config;
}

// Create S3 client configured for Cloudflare R2
function createR2Client() {
	const config = getR2Config();
	
	return new S3Client({
		region: 'auto',
		endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey
		}
	});
}

export const R2_CONFIG = {
	get bucketName() {
		return getR2Config().bucketName;
	},
	get publicUrl() {
		return getR2Config().publicUrl;
	}
};

/**
 * Get the public URL for an image stored in R2
 * @param key - The object key (path) in the R2 bucket
 * @returns The full public URL to access the image
 */
export function getImageUrl(key: string): string {
	const config = getR2Config();
	// If using R2 public bucket or custom domain
	if (config.publicUrl) {
		return `${config.publicUrl}/${key}`;
	}
	// Fallback - you'll need to set up public access or use presigned URLs
	throw new Error('R2_PUBLIC_URL not configured');
}

/**
 * List all images in the R2 bucket
 * @param prefix - Optional prefix to filter images (e.g., 'portfolio/')
 * @returns Array of image keys
 */
export async function listImages(prefix = ''): Promise<string[]> {
	const config = getR2Config();
	const client = createR2Client();
	
	const command = new ListObjectsV2Command({
		Bucket: config.bucketName,
		Prefix: prefix
	});

	const response = await client.send(command);
	const contents = response.Contents || [];

	return contents
		.filter((item) => {
			const key = item.Key || '';
			// Filter for common image extensions
			return /\.(jpg|jpeg|png|webp|avif)$/i.test(key);
		})
		.map((item) => item.Key || '')
		.filter(Boolean);
}

/**
 * Get metadata for an image
 */
export async function getImageMetadata(key: string) {
	const config = getR2Config();
	const client = createR2Client();
	
	const command = new GetObjectCommand({
		Bucket: config.bucketName,
		Key: key
	});

	const response = await client.send(command);
	return {
		contentType: response.ContentType,
		contentLength: response.ContentLength,
		lastModified: response.LastModified,
		metadata: response.Metadata
	};
}
