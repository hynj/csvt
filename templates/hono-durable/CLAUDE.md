# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CSVT stack project with Hono, RPC, and Durable Objects (Cloudflare Workers + Svelte + Vite + Tailwind CSS + Hono + RPC + Durable Objects). It's a Single Page Application (SPA) with both client-side routing and server-side API capabilities using Hono framework with type-safe RPC, enhanced with stateful capabilities through Cloudflare Durable Objects.

## Essential Commands

### Development
```bash
# Start development server
{{packageManager}} run dev

# Type check Svelte components and TypeScript
{{packageManager}} run check
```

### Building and Deployment
```bash
# Build the project
{{packageManager}} run build

# Preview the built project locally
{{packageManager}} run preview

# Deploy to Cloudflare Workers
{{packageManager}} run deploy
```

### Package Management
This project uses {{packageManager}} as the package manager. Use `{{packageManager}} install` to install dependencies.

## Architecture

### Project Structure
- `src/backend/` - Backend application code
  - `index.ts` - Hono server implementation with API routes (Cloudflare Worker entry point)
  - `counter-durable-object.ts` - Counter Durable Object implementation with KV storage
- `src/frontend/` - Frontend application code
  - `main.ts` - Client-side application entry point
  - `App.svelte` - Root Svelte component
  - `routes/` - Page components for client-side routing
  - `lib/` - Reusable Svelte components and API client
  - `assets/` - Frontend assets (images, icons, etc.)
- `public/` - Static assets served directly
- `dist/` - Build output directory

### Key Technologies
- **Svelte 5** with TypeScript support
- **Vite 7** for fast development and building
- **Cloudflare Workers** for serverless deployment
- **@dvcol/svelte-simple-router** for client-side routing
- **Hono** web framework for Cloudflare Workers
- **@hono/rpc** for type-safe API communication
- **Cloudflare Durable Objects** for stateful, persistent data storage
- **Durable Objects RPC** for direct method calls instead of fetch-based communication

### Configuration
- **vite.config.ts** - Vite configuration with Svelte and Cloudflare plugins
- **wrangler.jsonc** - Cloudflare Workers configuration (defines routes and assets)
- **tsconfig.app.json** - TypeScript config for application code
- **svelte.config.js** - Svelte preprocessing configuration

### Important Notes
- API routes (`/api/*`) are prioritized over static assets in Cloudflare Workers
- The project uses ES2022 target for browser compatibility
- TypeScript is configured to check JavaScript files in Svelte components
- Server-side code in `src/backend/index.ts` runs in Cloudflare Workers environment using Hono framework
- Frontend code is organized in `src/frontend/` for clean separation from backend
- RPC client in `src/frontend/lib/api.ts` provides type-safe API calls with automatic type inference
- All API routes are defined in `src/backend/index.ts` and exported as `AppType` for client-side type safety
- Wrangler is configured to use `src/backend/index.ts` as the main entry point for the worker
- Vite is configured to use `src/frontend/main.ts` as the frontend entry point
- **Durable Objects** provide persistent, stateful storage with automatic session management via cookies
- **Session Management**: Each user gets a unique Durable Object instance based on `do_id` cookie
- **Storage Backend**: Durable Objects use SQL storage backend with KV API for simplified data management
- **RPC Communication**: Durable Objects use direct method calls instead of fetch-based communication for better type safety and performance

## Durable Objects Architecture

### Counter Durable Object
This template includes a `CounterDurableObject` class that demonstrates stateful storage patterns:

#### Key Features
- **Session-based instances**: Each user session gets its own Durable Object instance
- **Persistent storage**: Uses Durable Objects KV API with SQL storage backend
- **Type-safe RPC**: Direct method calls instead of HTTP requests
- **Cookie-based sessions**: Automatic session management via `do_id` cookie

#### Available Methods
- `getValue()`: Get current counter value
- `increment()`: Increment counter and return new value
- `decrement()`: Decrement counter and return new value  
- `reset()`: Reset counter to 0

#### API Endpoints
- `GET /api/counter` - Get current counter value
- `POST /api/counter/increment` - Increment counter
- `POST /api/counter/decrement` - Decrement counter
- `POST /api/counter/reset` - Reset counter to 0

All endpoints return the current value, session ID, and timestamp.

### Adding New Durable Objects
1. Create new Durable Object class in `src/backend/`
2. Add binding to `wrangler.jsonc` durable_objects section
3. Add migration entry for new class
4. Update `Env` type in `src/backend/index.ts`
5. Add API routes that interact with the Durable Object
6. Update frontend to use new API endpoints

## Styling Guidelines

**Always use Tailwind CSS for styling.** This project is configured with:
- Tailwind CSS v4 with Vite integration
- Utility libraries: `clsx`, `tailwind-merge`, `tailwind-variants`
- Animation utilities via `tw-animate-css`

**Use shadcn-svelte for UI components.** When implementing UI elements:
- Check if a shadcn-svelte component exists before creating custom components
- Follow shadcn-svelte patterns for component structure and styling
- Use the `$lib` alias for importing from `src/lib/`