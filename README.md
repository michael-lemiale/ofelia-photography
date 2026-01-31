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

2. Create a `.env` file in the project root with your SMTP credentials:

```sh
SMTP_USER=your-email
SMTP_PASS=your-app-password
```

## Development

Start the development server:

```sh
bun dev

# or start the server and open the app in a new browser tab
bun dev --open
```

## Building

To create a production version:

```sh
bun build
```

Preview the production build:

```sh
bun preview
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
