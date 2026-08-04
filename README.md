# Ofelia Eme Photography

A modern photography portfolio website built with SvelteKit.

## Prerequisites

- Node.js (v20.11.0 or higher)
- Bun (v1.3.8 or higher)

It is recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js versions. You can switch to the correct version by running:

```sh
nvm use 
```

## Setup

1. Clone the repository and install dependencies:

```sh
bun install
```

## Development

Start the development server:

```sh
bun dev

# or start the server and open the app in a new browser tab
bun dev --open
```

### Local dev with Cloudflare R2 (remote bindings)

For local development that uses Cloudflare R2 bindings (same as production), run the Cloudflare Pages worker locally:

```sh
bun run build
bun x wrangler dev .svelte-kit/cloudflare/_worker.js --env production
```


Notes:
- This uses the R2 binding defined in wrangler.toml and the production bucket.
- If you want a preview bucket instead, set up `preview_bucket_name` and run without `--env production`.

## Building

To create a production version:

```sh
bun run build
```

Preview the production build:

```sh
bun preview
```

## Deploy locally
```sh
wrangler deploy
```

```
## Features

- Dynamic image carousel on home page
- Selected work gallery with responsive layout
- About page
- Responsive design for mobile and desktop

## Project Structure

- `/src/routes` - Page components and routing
- `/src/lib/components` - Reusable components
