# Ofelia Eme Photography

A modern photography portfolio website built with SvelteKit.

## Prerequisites

- Node.js (v18 or higher)
- pnpm

## Setup

1. Clone the repository and install dependencies:

```sh
pnpm install
```

2. Create a `.env` file in the project root with your SMTP credentials:

```sh
SMTP_USER=your-email
SMTP_PASS=your-app-password
```

## Development

Start the development server:

```sh
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev --open
```

## Building

To create a production version:

```sh
pnpm build
```

Preview the production build:

```sh
pnpm preview
```

## Features

- Dynamic image carousel on home page
- Portfolio gallery with responsive layout
- About page
- Responsive design for mobile and desktop

## Project Structure

- `/src/routes` - Page components and routing
- `/src/lib/components` - Reusable components
- `/src/lib/assets/img` - Portfolio images
