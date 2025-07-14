import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import path from "path";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(), 
    cloudflare(), 
    tailwindcss()
  ],
  optimizeDeps: {
    exclude: ['sqlocal'],
  },
  server: {
    watch: {
      ignored: ['**/.wrangler/**']
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  resolve: {
    alias: {
      $lib: path.resolve("./src/frontend/lib"),
    },
  },
  build: {
    manifest: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve('./index.html')
      }
    }
  }
})
