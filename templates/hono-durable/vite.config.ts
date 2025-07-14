import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import path from "path";


// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), cloudflare(), tailwindcss()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/frontend/lib"),
    },
  },
})
