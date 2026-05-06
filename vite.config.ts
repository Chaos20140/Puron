import { defineConfig } from 'vite'
import path from 'path'
import { copyFileSync, existsSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves repos at /<repo-name>/ by default. Set GHP_BASE
// at build time (the workflow sets it to "/Puron/") so asset URLs
// resolve correctly. With a custom domain at the root, leave it
// unset / set to "/".
const base = process.env.GHP_BASE ?? '/'

// SPA fallback for static hosts that don't support rewrites
// (notably GitHub Pages): copy dist/index.html to dist/404.html so
// any unknown path serves the SPA shell. Status will be 404 — not
// great for SEO but the page renders correctly and react-router
// takes over from the URL.
function spa404Fallback() {
  return {
    name: 'spa-404-fallback',
    apply: 'build' as const,
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const src = path.join(dist, 'index.html')
      const dst = path.join(dist, '404.html')
      if (existsSync(src)) copyFileSync(src, dst)
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), spa404Fallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
