import { defineConfig } from 'vite'
import path from 'path'
import { copyFileSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
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
  "connect-src 'self' https://fhgevybapodhubkuylnw.supabase.co https://api.web3forms.com",
  "object-src 'none'",
  "frame-src 'none'",
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

// Static-host routing for GitHub Pages, which has no SPA rewrite and returns
// HTTP 404 for any path without a real file — and Google will NOT index a 404.
//  - copy dist/index.html -> dist/404.html so genuinely-unknown paths still
//    render the SPA shell (status 404, correct -> NotFoundPage).
//  - write a real index.html for every KNOWN route so GitHub Pages returns
//    HTTP 200 on a direct hit / to a crawler. Each copy self-canonicalises
//    (canonical + og:url rewritten to its own URL) so the sub-pages aren't
//    consolidated onto the homepage. React-router still renders the right page
//    from the path client-side.
const SITE_ORIGIN = 'https://puron-media.de'
const ROUTES = ['services', 'projects', 'team', 'contact', 'imprint', 'privacy']
function spaStaticRoutes() {
  return {
    name: 'spa-static-routes',
    apply: 'build' as const,
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const src = path.join(dist, 'index.html')
      if (!existsSync(src)) return
      const home = readFileSync(src, 'utf8')
      writeFileSync(path.join(dist, '404.html'), home)
      for (const r of ROUTES) {
        // Trailing slash: GitHub Pages serves dist/<route>/index.html at
        // "/<route>/" (200) and 301-redirects "/<route>" -> "/<route>/", so the
        // canonical must be the slash form to match the actually-served URL.
        const url = `${SITE_ORIGIN}/${r}/`
        const html = home
          .replaceAll(`href="${SITE_ORIGIN}/"`, `href="${url}"`)
          .replaceAll(`content="${SITE_ORIGIN}/"`, `content="${url}"`)
        mkdirSync(path.join(dist, r), { recursive: true })
        writeFileSync(path.join(dist, r, 'index.html'), html)
      }
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), injectSecurityMeta(), spaStaticRoutes()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
