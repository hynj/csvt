# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CSVT stack project with Hono, RPC, Durable Objects, and Local SQLite Sync (Cloudflare Workers + Svelte + Vite + Tailwind CSS + Hono + RPC + Durable Objects + SQLocal). It's a Single Page Application (SPA) with offline-first architecture featuring local SQLite storage that bidirectionally syncs with Cloudflare Durable Objects for optimal performance and reliability.

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
- **Svelte 5** with TypeScript support and reactive runes
- **Vite 7** for fast development and building
- **Cloudflare Workers** for serverless deployment
- **@dvcol/svelte-simple-router** for client-side routing
- **Hono** web framework for Cloudflare Workers
- **@hono/rpc** for type-safe API communication
- **Cloudflare Durable Objects** for stateful, persistent data storage
- **Durable Objects RPC** for direct method calls instead of fetch-based communication
- **SQLocal** for client-side SQLite database with Origin Private File System
- **Offline-First Architecture** with automatic bidirectional synchronization
- **Reactive KV Store** using Svelte 5 runes for real-time UI updates

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
- **Cross-Origin Isolation**: Required headers are automatically set for SQLocal compatibility
- **Offline-First**: All data operations work offline and sync automatically when online
- **Real-Time Updates**: UI automatically updates when data changes using Svelte 5 runes
- **Progressive Web App**: Full PWA support with service worker caching and offline functionality
- **Auto-Updates**: Automatic service worker updates with user prompts

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

## PersistedState Architecture

### Reactive Persisted State System
This template includes a comprehensive offline-first reactive state management system using SQLocal for client-side SQLite storage:

#### Key Components
- **persistedState** (`src/frontend/lib/persistedState/persistedState.svelte.ts`): Core reactive state management with automatic persistence
- **SQLiteStorageAdapter** (`src/frontend/lib/persistedState/sqliteAdapter.ts`): SQLite storage backend using SQLocal
- **WebSocketSyncAdapter** (`src/frontend/lib/persistedState/websocketAdapter.ts`): Real-time synchronization via WebSocket
- **TodoApp** (`src/frontend/lib/TodoApp.svelte`): Example todo application demonstrating the architecture

#### Features
- **Offline-First**: All operations work immediately, even without internet
- **Automatic Sync**: Changes sync automatically when online via WebSocket
- **Conflict Resolution**: Last-write-wins strategy with extensible conflict handling
- **Real-Time UI**: Svelte 5 runes provide instant UI updates
- **Session Persistence**: Data persists across browser sessions using Origin Private File System
- **Debounced Saves**: Configurable debouncing prevents excessive writes
- **Error Handling**: Comprehensive error handling with user feedback

#### Usage Pattern
```typescript
import { persistedState } from '$lib/persistedState';

// Create a persisted state with 200ms debounce
const todos = persistedState<Todo[]>('todos', [], 200);

// Access reactive values
const value = todos.value;
const isLoading = todos.isLoading;
const isSaving = todos.isSaving;
const isOnline = todos.isOnline;
const error = todos.error;

// Update state
todos.set(newValue);
todos.update(list => [...list, newItem]);

// Manual operations
await todos.forceSave();
await todos.refresh();
```

#### Built-in Status Monitoring
- Loading state during initialization
- Saving state with debounced updates
- Online/offline connection status
- Error handling with user feedback
- Real-time sync status indication

### Cross-Origin Isolation
Required for SQLocal, automatically configured:
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

## Progressive Web App (PWA) Features

### Service Worker & Caching
This template includes comprehensive PWA support with Workbox:

#### Features
- **Pre-caching**: All static assets are cached for offline use
- **Runtime Caching**: API responses cached with NetworkFirst strategy
- **Auto-Updates**: Automatic service worker updates with user prompts
- **Font Caching**: Google Fonts cached for offline use
- **Install Prompt**: Native app installation prompt for supported browsers

#### Cache Strategies
- **Static Assets**: Pre-cached during build (CacheFirst)
- **API Calls**: NetworkFirst with 10s timeout, falls back to cache
- **External Fonts**: CacheFirst with 1-year expiration
- **Images**: CacheFirst with size limits

#### PWA Installation
- Install prompt appears for eligible browsers
- Native app-like experience when installed
- Standalone display mode with custom theme
- Offline functionality maintained after installation

#### Service Worker Updates
- Automatic update checks on app load
- User-friendly update prompts
- Seamless updates without data loss
- Background sync capabilities

## Styling Guidelines

**Always use Tailwind CSS for styling.** This project is configured with:
- Tailwind CSS v4 with Vite integration
- Utility libraries: `clsx`, `tailwind-merge`, `tailwind-variants`
- Animation utilities via `tw-animate-css`

**Use shadcn-svelte for UI components.** When implementing UI elements:
- Check if a shadcn-svelte component exists before creating custom components
- Follow shadcn-svelte patterns for component structure and styling
- Use the `$lib` alias for importing from `src/lib/`