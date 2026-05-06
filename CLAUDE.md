# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Maintenance rule (per user request):** Whenever you change anything in this repo, update this file in the same turn so it stays in sync — paths, commands, behaviours, known issues. If a section here becomes wrong, fix it; do not leave stale guidance behind.

## 1. What this project is

Marketing one-pager + sub-pages for **Puron Media (Meschede)**, a German social-media agency. It is a single-page React app generated initially in [Figma Make](https://www.figma.com/design/8kTJdiApN2rWkNNCjgVfPH/Puron) and then ejected — that origin explains some of the quirks below. All UI copy is **German**; only code/comments are English.

The site has two pieces of live data: a Google Places "reviews" widget on the home page, and a contact-form submission endpoint — both served by a Supabase Edge Function.

## 2. Stack at a glance

| Layer | Choice |
|---|---|
| Build | Vite 6 + `@vitejs/plugin-react` |
| UI | React 18.3 + TypeScript (strict, see §3) |
| Routing | `react-router` **v7** (`createBrowserRouter`, file [src/app/routes.tsx](src/app/routes.tsx)) |
| Styling | Tailwind CSS **v4** via `@tailwindcss/vite` (no `tailwind.config.*`; sources declared in [src/styles/tailwind.css](src/styles/tailwind.css) with `@source`) |
| Animations | `motion` (Framer Motion successor) + two hand-rolled `<canvas>` scenes; reduced-motion is honoured |
| Lint | ESLint 9 flat config ([eslint.config.js](eslint.config.js)) — `pnpm lint` |
| E2E | Playwright (chromium only, mocks the edge function via `page.route()`) |
| Package manager | **pnpm** (use `corepack pnpm …` if pnpm isn't on PATH; `npm install` will fail because of the lockfile format) |
| Backend | Supabase Edge Function (Deno + Hono) at [supabase/functions/make-server-1fdc8e05/index.ts](supabase/functions/make-server-1fdc8e05/index.ts), backed by a Postgres KV table `kv_store_1fdc8e05`; emails via Resend |

Peer deps mark `react`/`react-dom` optional — they get hoisted from the resolved deps tree. Do not "fix" this by promoting them to `dependencies` unless you understand the Figma Make packaging contract.

## 3. Commands

```bash
pnpm install          # install (use `corepack pnpm install` if pnpm isn't on PATH)
pnpm dev              # vite dev server on http://localhost:5173
pnpm build            # production build → dist/
pnpm preview          # serve the built dist/ locally to smoke-test
pnpm typecheck        # tsc --noEmit (strict mode, src/ only)
pnpm lint             # eslint . (flat config, src/ + tests/)
pnpm test             # playwright e2e tests (auto-starts vite dev server)
pnpm test:ui          # playwright in UI mode
pnpm test:install     # one-time: download chromium for playwright (~170 MB)
```

The Edge Function deploys via the Supabase CLI / dashboard; this repo has no deploy script for it (see §7).

`tsconfig.json` covers only `src/`. The `supabase/functions/**` code uses Deno-specific imports (`npm:hono`, `jsr:@supabase/...`, `Deno.env`) and is intentionally excluded from `tsc`. ESLint also ignores `supabase/`. The edge function file declares a tiny `Deno` shim at the top so editor LSPs targeting browser-tsconfig don't flag every `Deno.*` reference.

E2E tests live under [tests/](tests/) and use Playwright with chromium only. They mock the Edge Function via `page.route()` so they don't send real emails. `playwright.config.ts` auto-starts `pnpm dev` if it isn't already running.

## 4. Architecture / mental model

### Frontend
```
src/
  main.tsx                  ← creates root, imports styles/index.css
  styles/                   ← fonts.css → Google Fonts; tailwind.css; theme.css (shadcn tokens — see §5)
  app/
    api.ts                  ← shared SUPABASE_FUNCTION_URL constant for all backend calls
    App.tsx                 ← <ErrorBoundary><MotionConfig reducedMotion="user"><RouterProvider/></...></...>
    routes.tsx              ← all routes; Layout is parent, pages are leaves
    hooks/
      usePageTitle.ts       ← effect-based <title> manager (auto-restores on unmount)
    components/
      ErrorBoundary.tsx     ← class boundary + PageErrorFallback. Wrapped at app root + around each canvas.
      Layout.tsx            ← fixed nav + footer + <ErrorBoundary><AnimatedBackground/></...> + <Outlet/>
      AnimatedBackground.tsx← full-screen canvas (rotating particle sphere, auroras, dust)
                              — pauses on document.hidden, single static frame on prefers-reduced-motion
      Hero3DVisual.tsx      ← per-page canvas (solar-system) used only on HomePage, lg+ only — same pause/reduced-motion logic
      AnimatedButton.tsx    ← THE button component. Every CTA goes through it (variants: primary/secondary/outline/nav/ghost)
      PuronLogo.tsx         ← inline SVG hex logo
      GoogleReviewCard.tsx, useGoogleReviews.ts  ← live reviews integration
      figma/ImageWithFallback.tsx  ← <img> wrapper with placeholder on error; defaults to loading="lazy" + decoding="async"
      sections/             ← section components composed by HomePage (HeroSection, ClientTicker, ServicesPreview, SelectedWorks, GoalsSection, WhyPuronSection, SocialProof, ContactCta)
      pages/                ← one component per route (HomePage, ServicesPage, ProjectsPage, TeamPage, ContactPage, ImprintPage, PrivacyPage, NotFoundPage)
public/
  favicon.svg               ← Puron logo as SVG favicon
  manifest.webmanifest      ← PWA manifest
  robots.txt                ← Allow all
  _headers                  ← Netlify/Cloudflare Pages security headers (see §9)
```

Routes (defined in [src/app/routes.tsx](src/app/routes.tsx)):
`/` (Home) · `/services` · `/projects` · `/team` · `/contact` · `/imprint` · `/privacy` · `*` (NotFoundPage)

Because the router is a **browser** router, any host serving the production build must rewrite unknown paths to `index.html`.

### Design system (de-facto, not enforced anywhere)
The project does **not** use the shadcn theme tokens. Pages use raw Tailwind arbitrary-value classes with hard-coded hex literals everywhere. The recurring palette:

| Token | Hex | Used for |
|---|---|---|
| Background base | `#0A0A0D`, `#050508`, `#121217`, `#111116` | page/card surfaces (varying opacity) |
| Foreground | `#F5F5F7` | primary text |
| Muted text | `#B3B3C2`, `#71717A` | secondary text |
| Brand purple | `#7C3AED` (deep), `#A855F7` (bright) | accents, gradients, glows |
| Borders | `white/5`, `white/10` | hairlines |
| Fonts | `Inter` (body), `Space Grotesk` (display) | imported via Google Fonts in [src/styles/fonts.css](src/styles/fonts.css) |

When adding UI, copy this convention rather than reaching for `bg-primary`/`text-foreground`. Note: [index.html](index.html) sets `<html class="dark">` so the theme.css `.dark` variant is the one that applies.

### Backend (Edge Function endpoints)

The Hono handler in [supabase/functions/make-server-1fdc8e05/index.ts](supabase/functions/make-server-1fdc8e05/index.ts) exposes two endpoints, both prefixed with `/make-server-1fdc8e05`. The frontend uses the shared base URL from [src/app/api.ts](src/app/api.ts) (`SUPABASE_FUNCTION_URL`).

**`GET /google-reviews`** — fetches live Google Places reviews.
1. Reads `GOOGLE_PLACES_API_KEY` from Deno env.
2. Resolves the Place ID for `"Puron Media Meschede"` via Places API (New) `places:searchText` and caches it forever in KV (`google_reviews:puron_media_meschede:place_id`).
3. Fetches place details (`rating`, `userRatingCount`, `googleMapsUri`, `reviews[]`) with `languageCode=de`.
4. Caches the normalized payload in KV (`google_reviews:puron_media_meschede`) for **1 hour**, but **only on success with at least one review** — error states never poison the cache.
5. `?force=1` bypasses the read-cache (still writes to it). The frontend never sends it; it's a manual debug knob.

**`POST /contact`** — accepts contact-form submissions and forwards them via Resend.
1. Validates required fields (`name`, `email`, `message`), enforces length limits, and checks `goal` against a whitelist.
2. **Honeypot**: if the hidden `website` field has any value, returns `200 OK` silently without sending — bots see success and don't learn the field name.
3. **Per-IP rate limit**: max 3 submissions per IP per hour, tracked in KV under `contact_rl:<ip>`. IP comes from `CF-Connecting-IP` or `X-Forwarded-For`.
4. Sends a formatted HTML email via the Resend API to `CONTACT_EMAIL_TO` (default `Tolunay.u@outlook.de`) from `CONTACT_EMAIL_FROM` (default `onboarding@resend.dev`). `reply_to` is set to the submitter's email.
5. Form data is **never persisted** — only forwarded as email. Keeps DSGVO position simple.

**CORS** is read from `ALLOWED_ORIGINS` env var (comma-separated origins, default `*`). Once the production domain is known, set it to e.g. `https://puron.agency,https://www.puron.agency` so the `POST /contact` endpoint can't be abused by other sites.

**KV** is a thin wrapper over a single Postgres table `kv_store_1fdc8e05` with `(key TEXT PK, value JSONB)` (see [supabase/functions/make-server-1fdc8e05/kv_store.ts](supabase/functions/make-server-1fdc8e05/kv_store.ts)). It currently holds: cached place ID, cached reviews payload, per-IP contact rate-limit counters.

## 5. Known issues / footguns (read before changing things)

1. **shadcn theme variables are inert for hand-built pages.** [src/styles/theme.css](src/styles/theme.css) defines a full light/dark CSS-variable system, but the entire app uses hex literals directly. No vendored shadcn primitives are reachable from the route tree right now (the `ui/` directory was deleted as part of the dep audit). If you add shadcn components later via the shadcn CLI, they'll render in dark mode because of `<html class="dark">`.
2. **`AnimatedBackground` reads `window.innerWidth` only at mount** to decide particle counts; rotating a phone keeps the original count. Acceptable trade-off, just don't be surprised.
3. **Don't lower the `AnimatedBackground` canvas z-index below 0.** It's `position: fixed; z-index: 0`. The body has a dark background to kill the white-flash on initial load. A negative z-index puts the canvas *behind* the body background — invisible. Page content stays visible because nav is `z-50` and `main`/`footer` are `z-10` (both above the canvas).
4. **`pnpm-workspace.yaml` lists `.` as a workspace** and `package.json` is named `@figma/my-make-file`. Both are leftovers from the Figma Make template. Renaming is cosmetic; safe but not necessary.

## 6. Conventions worth preserving

- **All CTAs go through `<AnimatedButton>`.** Don't introduce raw `<button>`/`<a>` for primary actions — pick a variant (`primary | secondary | outline | nav | ghost`) and pass `to=` (Link), `href=` (external), or `onClick=`.
- **Page sections** are typically wrapped in `motion.div` with `initial / whileInView / viewport={{ once: true }}` for scroll-in fades. Match this pattern when adding new sections so the feel stays consistent.
- **Page top padding** is always `pt-24 md:pt-32` to clear the fixed `h-16 md:h-20` nav. New pages should follow this or the hero will end up under the nav bar.
- **`isolation: "isolate"`** is set on most major sections. This creates a new stacking context so the absolute-positioned glow blobs don't bleed into other sections — keep it when copying section markup.
- **No comments in code unless explaining WHY.** The codebase already follows this; respect it.
- **Page components stay thin orchestrators.** HomePage composes `<HeroSection/>` + `<ClientTicker/>` + … Don't inline section markup back into a page — split it into `src/app/components/sections/`.
- **Add `usePageTitle("…")` to every new top-level page.** The hook auto-restores the previous title on unmount, so navigating between routes always lands on the right `<title>`.
- **Wrap risky canvas/iframe-style children in `<ErrorBoundary>`.** Default fallback is silent (returns nothing), so the rest of the page survives. App root uses `<PageErrorFallback/>` for fatal renders.

## 7. Edge-function changes

The Edge Function lives at [supabase/functions/make-server-1fdc8e05/index.ts](supabase/functions/make-server-1fdc8e05/index.ts) and is deployed to the `fhgevybapodhubkuylnw` project under the function slug **`make-server-1fdc8e05`** (so its full URL ends in `/functions/v1/make-server-1fdc8e05/...`). To redeploy you need the Supabase CLI logged into that project; this repo has no script for it.

**Function Secrets** are managed via [supabase/.env](supabase/.env) (gitignored). The committed [supabase/.env.example](supabase/.env.example) documents every variable + how to obtain it. To push secrets to the live function:

```bash
supabase secrets set --env-file supabase/.env --project-ref fhgevybapodhubkuylnw
```

Variables (set in `supabase/.env`):
- `GOOGLE_PLACES_API_KEY` — required for `/google-reviews`
- `RESEND_API_KEY` — required for `/contact`
- `CONTACT_EMAIL_TO` (optional, default `Tolunay.u@outlook.de`)
- `CONTACT_EMAIL_FROM` (optional, default `onboarding@resend.dev` — replace with `noreply@yourdomain` once you verify the domain in Resend so emails don't land in spam)
- `ALLOWED_ORIGINS` (optional, default `*`) — comma-separated allow-list, e.g. `https://puron.agency,https://www.puron.agency`

After editing the function code in this repo, redeploy via Supabase CLI:

```bash
supabase functions deploy make-server-1fdc8e05 --project-ref fhgevybapodhubkuylnw --no-verify-jwt
```

`--no-verify-jwt` keeps the endpoints public (matches current production behaviour). Without it, Supabase enforces JWT verification on the function and the marketing site can't reach it.

Alternatively paste the file contents into the Supabase Dashboard → Edge Functions → server → Edit and click "Deploy".

## 8. Code → Figma snapshots (reference)

A pixel-perfect snapshot of all 7 pages was captured into a separate Figma file via the Figma MCP `generate_figma_design` tool: [Puron — Code Snapshot](https://www.figma.com/design/SWTnb2PLVd7VcmRtVR7Sbf). This is **not** the design source of truth — the Figma Make file `8kTJdiApN2rWkNNCjgVfPH` still is. The snapshot is a reference of what the live code rendered to.

If you ever need to re-snapshot:

1. Make sure `pnpm dev` is running.
2. Temporarily add `<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>` to `index.html`'s `<head>`.
3. Use the Figma MCP `generate_figma_design` tool to get a `captureId`, then open `http://localhost:5173/<route>#figmacapture=<captureId>&figmaendpoint=...&figmadelay=2000` in a real browser tab.
4. **One page at a time, foreground tab only.** Background tabs get throttled by Chrome/Edge (`requestAnimationFrame` paused), and the heavy canvases never finish rendering — captures stall in `pending` forever.
5. Poll with the same `captureId` until status is `completed`, then move to the next page.
6. Remove the `<script>` tag from `index.html` when done — never commit it.

## 9. Production hosting / security headers

[public/_headers](public/_headers) ships a Netlify / Cloudflare Pages compatible header file with HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy, and a strict Referrer-Policy. The CSP allows: self, Google Fonts, Unsplash images, Google profile photos, and the Supabase Edge Function origin — and forbids inline `<script>` (allows inline `style` because motion + section keyframes need it).

If you deploy to **Vercel**, translate the same rules into a `vercel.json` (the `_headers` file is ignored). Skeleton:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=(), interest-cohort=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://*.googleusercontent.com; connect-src 'self' https://fhgevybapodhubkuylnw.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" }
      ]
    }
  ]
}
```

For SPA fallback (so direct visits to `/services` etc. don't 404):
- **Netlify / Cloudflare Pages**: [public/_redirects](public/_redirects) is committed (`/*    /index.html   200`).
- **Vercel**: ignores `_redirects`. Add a `vercel.json` `rewrites` block pointing everything to `/index.html`.
- **GitHub Pages**: ignores both. The `spa-404-fallback` Vite plugin in [vite.config.ts](vite.config.ts) copies `dist/index.html` → `dist/404.html` so unknown paths still render the SPA shell (status 404, but functional).

After deploying, also update Supabase function secret `ALLOWED_ORIGINS` to lock the contact endpoint to your production domain — see §7.

### GitHub Pages deploy

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds + deploys on every push to `main` via `actions/deploy-pages`. The workflow sets `GHP_BASE=/Puron/` so Vite emits asset URLs under the repo subpath. React Router reads the same value via `import.meta.env.BASE_URL` and applies it as `basename`.

To switch to a custom domain at the apex (`https://puron-media.de`):
1. Set GHP custom domain in repo Settings → Pages.
2. Remove (or set to `/`) the `GHP_BASE` env var in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
3. Add `public/CNAME` containing the domain on a single line.

Note: GitHub Pages **ignores `public/_headers`** — security headers (CSP, HSTS, …) won't apply. If headers matter, deploy to Netlify or Cloudflare Pages instead.
