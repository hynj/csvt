# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Svelte 5 + TypeScript + Vite project configured for deployment to Cloudflare Workers. It's a Single Page Application (SPA) with both client-side routing and server-side API capabilities.

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Type check Svelte components and TypeScript
npm run check
```

### Building and Deployment
```bash
# Build the project
npm run build

# Preview the built project locally
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

### Package Management
This project uses Bun as the package manager. Use `bun install` to install dependencies.

## Architecture

### Project Structure
- `src/index.ts` - Cloudflare Worker entry point (handles server-side logic and API routes)
- `src/main.ts` - Client-side application entry point
- `src/App.svelte` - Root Svelte component
- `src/routes/` - Page components for client-side routing
- `src/lib/` - Reusable Svelte components
- `public/` - Static assets served directly
- `dist/` - Build output directory

### Key Technologies
- **Svelte 5** with TypeScript support
- **Vite 7** for fast development and building
- **Cloudflare Workers** for serverless deployment
- **@dvcol/svelte-simple-router** for client-side routing

### Configuration
- **vite.config.ts** - Vite configuration with Svelte and Cloudflare plugins
- **wrangler.jsonc** - Cloudflare Workers configuration (defines routes and assets)
- **tsconfig.app.json** - TypeScript config for application code
- **svelte.config.js** - Svelte preprocessing configuration

### Important Notes
- API routes (`/api/*`) are prioritized over static assets in Cloudflare Workers
- The project uses ES2022 target for browser compatibility
- TypeScript is configured to check JavaScript files in Svelte components
- Server-side code in `src/index.ts` runs in Cloudflare Workers environment

## Styling Guidelines

**Always use Tailwind CSS for styling.** This project is configured with:
- Tailwind CSS v4 with Vite integration
- Utility libraries: `clsx`, `tailwind-merge`, `tailwind-variants`
- Animation utilities via `tw-animate-css`

**Use shadcn-svelte for UI components.** When implementing UI elements:
- Check if a shadcn-svelte component exists before creating custom components
- Follow shadcn-svelte patterns for component structure and styling
- Use the `$lib` alias for importing from `src/lib/`