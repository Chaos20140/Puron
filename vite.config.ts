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

// GitHub Pages ignores public/_headers, so the production deployment would
// otherwise ship with NO Content-Security-Policy. We inject the CSP (plus a
// Referrer-Policy) as <meta> tags at BUILD time only — never in dev, where a
// strict script-src/connect-src would break Vite's HMR (eval + ws://).
// Note: frame-ancestors / X-Frame-Options can't be delivered via <meta>, so
// clickjacking protection still requires real HTTP headers (Netlify/CF — see
// public/_headers). The meta CSP still blocks the primary XSS vectors.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://images.unsplash.com https://*.googleusercontent.com",
  "connect-src 'self' https://fhgevybapodhubkuylnw.supabase.co",
  // Google Maps location embed on the /contact page (keyless iframe).
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

function injectSecurityMeta() {
  return {
    name: 'inject-security-meta',
    apply: 'build' as const,
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_DIRECTIVES },
          injectTo: 'head-prepend' as const,
        },
        {
          tag: 'meta',
          attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' },
          injectTo: 'head-prepend' as const,
        },
      ]
    },
  }
}

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
  plugins: [react(), tailwindcss(), injectSecurityMeta(), spa404Fallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
