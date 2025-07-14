# create-csvt

🚀 **The fastest way to create a CSVT stack project**

**CSVT** = **C**loudflare Workers + **S**velte + **V**ite + **T**ailwind CSS

A CLI tool to scaffold new projects with the modern CSVT stack: Cloudflare Workers, Svelte 5, Vite, TypeScript, and Tailwind CSS.

## Features

✨ **Modern Stack**
- Svelte 5 with TypeScript
- Vite 7 for fast development
- Tailwind CSS v4 for styling
- Cloudflare Workers for serverless deployment

🛠️ **Developer Experience**
- Interactive prompts for project setup
- Choice of package manager (Bun, npm, yarn, pnpm)
- Automatic dependency installation
- Git repository initialization
- shadcn-svelte UI components ready

⚡ **Built with Bun**
- Lightning-fast CLI execution
- Native TypeScript support
- Single executable binary

📝 **Why Not SvelteKit?**
- Uses Cloudflare Vite plugin + Svelte instead of SvelteKit
- SvelteKit doesn't currently support Cloudflare's environment API
- This limitation prevents access to features like Durable Objects RPC
- Our approach ensures full compatibility with all Cloudflare Workers features

## Quick Start

### Using Bun (Recommended)
```bash
bun create csvt my-app
```

### Using npm
```bash
npm create csvt@latest my-app
```

### Using yarn
```bash
yarn create csvt my-app
```

### Using pnpm
```bash
pnpm create csvt my-app
```

## CLI Options

```bash
create-csvt [project-name] [options]
```

### Options

- `-h, --help` - Show help message
- `-t, --template` - Template to use (default: default)
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation
- `--use-npm` - Use npm as package manager
- `--use-yarn` - Use yarn as package manager
- `--use-pnpm` - Use pnpm as package manager

### Examples

```bash
# Basic usage
bun create cf-svelte my-awesome-app

# With specific package manager
npm create csvt@latest my-app --use-npm

# Skip git and dependency installation
bun create csvt my-app --no-git --no-install

# Show help
bun create csvt --help
```

## What's Included

After running the CLI, you'll have a fully configured project with:

### 📁 Project Structure
```
my-app/
├── src/
│   ├── index.ts          # Cloudflare Worker entry point
│   ├── main.ts           # Client-side app entry
│   ├── App.svelte        # Root Svelte component
│   ├── routes/           # Page components
│   ├── lib/              # Reusable components
│   └── assets/           # Static assets
├── public/               # Public assets
├── vite.config.ts        # Vite configuration
├── wrangler.jsonc        # Cloudflare Workers config
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── CLAUDE.md            # AI assistant guidance
```

### 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run check` - Type check the project

### 🎨 Styling Setup

- **Tailwind CSS v4** with Vite integration
- Utility libraries: `clsx`, `tailwind-merge`, `tailwind-variants`
- Animation utilities via `tw-animate-css`
- **shadcn-svelte** components ready to use

### ☁️ Cloudflare Workers Configuration

- SPA routing with fallback to `index.html`
- API routes prioritized at `/api/*`
- Asset serving with caching
- Node.js compatibility enabled

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `bun install`
3. Test locally: `bun run dev my-test-app`

### Building for Production

The CLI tool doesn't require a build step when using Bun, but you can create a compiled binary:

```bash
bun build ./bin/create-csvt.js --compile --outfile create-csvt
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

---

**Happy coding!** 🚀

Made with ❤️ using Bun and TypeScript