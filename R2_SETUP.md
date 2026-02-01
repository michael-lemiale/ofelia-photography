# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for hosting your photography portfolio images.

## What is Cloudflare R2?

Cloudflare R2 is S3-compatible object storage with:
- **No egress fees** (unlike AWS S3)
- Free tier: 10GB storage, 1 million Class A operations/month
- Built-in CDN delivery for fast global access
- Automatic image optimization available

## Step 1: Create a Cloudflare Account

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sign up for a free account if you don't have one
3. Note your **Account ID** from the dashboard URL or sidebar

## Step 2: Create an R2 Bucket

1. In the Cloudflare dashboard, navigate to **R2** in the sidebar
2. Click **Create bucket**
3. Choose a bucket name (e.g., `ofelia-photography-images`)
   - Must be globally unique
   - Use lowercase letters, numbers, and hyphens only
4. Select a location hint (choose closest to your audience)
5. Click **Create bucket**

## Step 3: Enable Public Access

### Option A: R2.dev subdomain (Quick & Free)

1. In your bucket settings, go to **Settings** tab
2. Under **Public access**, click **Allow Access**
3. Click **Enable R2.dev subdomain**
4. Copy the public URL (e.g., `https://pub-abc123.r2.dev`)

### Option B: Custom Domain (Recommended for Production)

1. Add a custom domain you own to Cloudflare
2. In bucket settings, click **Connect Custom Domain**
3. Enter your subdomain (e.g., `images.yourdomain.com`)
4. Cloudflare will automatically create the DNS record
5. Use this URL as your `R2_PUBLIC_URL`

## Step 4: Create API Credentials

1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure permissions:
   - **Token name**: `ofelia-photography-app`
   - **Permissions**: Admin Read & Write (or Object Read & Write)
   - **TTL**: No expiry (or set your preference)
   - **Bucket**: Select your specific bucket
4. Click **Create API token**
5. **IMPORTANT**: Copy the credentials immediately:
   - Access Key ID
   - Secret Access Key
   - You won't be able to see the secret again!

For 120 high-quality images (~3MB each = 360MB total), you'll stay well within the free tier.

## Step 5: Prepare Images

### 1. Resize for Web
Photography images don't need to be full resolution:
```bash
# Resize to max 2000px width
for f in *.jpg; do magick "$f" -resize 2000x\> "$f"; done
```

### 2. Use WebP or AVIF Format
Convert images before uploading for better compression:
```bash
# Using ImageMagick
for f in *.jpg; do magick "$f" -quality 85 "${f%.jpg}.webp"; done
```

### 3. Remove old .jpg images
```bash
for f in *.jpg; do rm "$f"; done
```


## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your R2 credentials:
   ```env
   R2_ACCOUNT_ID=your_account_id_here
   R2_ACCESS_KEY_ID=your_access_key_from_step_4
   R2_SECRET_ACCESS_KEY=your_secret_from_step_4
   R2_BUCKET_NAME=ofelia-photography-images
   R2_PUBLIC_URL=https://pub-abc123.r2.dev
   ```

3. Save the file

## Step 7: Upload Your Images

### Prepare Your Images

Organize your images in a local folder, for example:
```
/Users/michael/Photos/portfolio/
  ├── photo-001.jpg
  ├── photo-002.jpg
  └── ...
```

### Upload Using the Script

1. **Dry run** (preview what will be uploaded):
   ```bash
   bun scripts/upload-images.ts ~/Downloads/ofelia-photos-2026 --prefix portfolio/ --dry-run
   ```

2. **Actual upload**:
   ```bash
   bun scripts/upload-images.ts ~/Downloads/ofelia-photos-2026 --prefix portfolio/
   ```

The script will:
- Recursively scan for image files (jpg, jpeg, png, webp, avif)
- Upload them to R2 with the `portfolio/` prefix
- Show progress for each file
- Display a summary when complete

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   bun run dev
   ```

2. Navigate to `/portfolio` in your browser

3. Images should load from R2 instead of local files

## Support

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://www.cloudflare.com/products/r2/)
- [API Reference](https://developers.cloudflare.com/r2/api/s3/)
