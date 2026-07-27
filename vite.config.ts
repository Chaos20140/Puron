import { defineConfig } from 'vite'
import path from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// Shared with the app: one source of truth for per-page title/description.
import { HOME_META, ROUTE_META, SITE_ORIGIN, fullTitle } from './src/app/seo'

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
  // Fonts are self-hosted since 2026-07-27 — no Google origins needed.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https://images.unsplash.com",
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
// NOTE: 'projects' is intentionally NOT in ROUTE_META — its route is commented
// out in routes.tsx ("hidden until we have a real portfolio"), so /projects/
// would render NotFoundPage and Google flags it as a Soft 404. Keep it out of
// both src/app/seo.ts and public/sitemap.xml until ProjectsPage is real content.
const ROUTES = Object.keys(ROUTE_META)

// Replace the CONTENT of a meta/link tag that is matched by an attribute pair,
// without touching the rest of the tag. Written as a targeted regex per tag so
// a stray identical string elsewhere in the document can't be clobbered.
function setTag(html: string, matchAttr: string, valueAttr: 'content' | 'href', value: string) {
  const re = new RegExp(`(<(?:meta|link)[^>]*${matchAttr}[^>]*\\s${valueAttr}=")([^"]*)(")`, 'i')
  const alt = new RegExp(`(<(?:meta|link)[^>]*\\s${valueAttr}=")([^"]*)("[^>]*${matchAttr})`, 'i')
  if (re.test(html)) return html.replace(re, (_m, a, _old, c) => a + escapeAttr(value) + c)
  if (alt.test(html)) return html.replace(alt, (_m, a, _old, c) => a + escapeAttr(value) + c)
  return html
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function spaStaticRoutes() {
  return {
    name: 'spa-static-routes',
    apply: 'build' as const,
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const src = path.join(dist, 'index.html')
      if (!existsSync(src)) return
      // index.html carries the home page's title/description literally so the
      // dev server shows something sensible; HOME_META is the source of truth,
      // so stamp it here too — otherwise the runtime title (usePageMeta) and
      // the indexed title could drift apart.
      let home = readFileSync(src, 'utf8')
      const homeTitle = fullTitle(HOME_META.title)
      home = home.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(homeTitle)}</title>`)
      home = setTag(home, 'name="description"', 'content', HOME_META.description)
      home = setTag(home, 'property="og:title"', 'content', homeTitle)
      home = setTag(home, 'property="og:description"', 'content', HOME_META.description)
      home = setTag(home, 'name="twitter:title"', 'content', homeTitle)
      home = setTag(home, 'name="twitter:description"', 'content', HOME_META.description)
      writeFileSync(src, home)

      // 404.html is the SPA shell for genuinely-unknown paths. It must NOT be
      // indexable: GitHub Pages serves it with status 404, but a crawler that
      // reaches it via a stale link would otherwise see the home page's
      // canonical and treat it as a duplicate of "/".
      const notFound = setTag(
        home.replace('</head>', '  <meta name="robots" content="noindex" />\n    </head>'),
        'rel="canonical"',
        'href',
        `${SITE_ORIGIN}/404`,
      )
      writeFileSync(path.join(dist, '404.html'), notFound)

      for (const r of ROUTES) {
        // Trailing slash: GitHub Pages serves dist/<route>/index.html at
        // "/<route>/" (200) and 301-redirects "/<route>" -> "/<route>/", so the
        // canonical must be the slash form to match the actually-served URL.
        const url = `${SITE_ORIGIN}/${r}/`
        const meta = ROUTE_META[r]
        const title = fullTitle(meta.title)

        let html = home
          .replaceAll(`href="${SITE_ORIGIN}/"`, `href="${url}"`)
          .replaceAll(`content="${SITE_ORIGIN}/"`, `content="${url}"`)
        // Each sub-page needs its OWN title + description, otherwise Google
        // sees five pages claiming to be the home page.
        html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`)
        html = setTag(html, 'name="description"', 'content', meta.description)
        html = setTag(html, 'property="og:title"', 'content', title)
        html = setTag(html, 'property="og:description"', 'content', meta.description)
        html = setTag(html, 'name="twitter:title"', 'content', title)
        html = setTag(html, 'name="twitter:description"', 'content', meta.description)

        mkdirSync(path.join(dist, r), { recursive: true })
        writeFileSync(path.join(dist, r, 'index.html'), html)
      }

      // Generate sitemap.xml here instead of hand-maintaining public/sitemap.xml:
      // it can no longer drift from ROUTE_META, and every entry gets a real
      // <lastmod> — the only field Google actually uses to prioritise recrawls.
      // <changefreq>/<priority> are dropped; Google has ignored them for years.
      const today = new Date().toISOString().slice(0, 10)
      const urls = ['', ...ROUTES.map((r) => `${r}/`)]
      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map((u) => `  <url><loc>${SITE_ORIGIN}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
        `\n</urlset>\n`
      writeFileSync(path.join(dist, 'sitemap.xml'), xml)
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
