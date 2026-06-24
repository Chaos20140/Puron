# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Maintenance rule (per user request):** Whenever you change anything in this repo, update this file in the same turn so it stays in sync — paths, commands, behaviours, known issues. If a section here becomes wrong, fix it; do not leave stale guidance behind.

## 1. What this project is

Marketing one-pager + sub-pages for **Puron Media (Meschede)**, a German social-media agency. It is a single-page React app generated initially in [Figma Make](https://www.figma.com/design/8kTJdiApN2rWkNNCjgVfPH/Puron) and then ejected — that origin explains some of the quirks below. All UI copy is **German**; only code/comments are English.

The site has two pieces of live data: a Google Places "reviews" widget on the home page, and a contact-form submission endpoint — both served by a Supabase Edge Function.

> **Contact page state (2026-06-24):** [ContactPage.tsx](src/app/components/pages/ContactPage.tsx) has the **email contact form** (name/company/email/message + goal chips, honeypot, client validation, success state) plus a fallback row of direct-channel cards (E-Mail `info@puron-media.de`, WhatsApp, Instagram `@puronmedia`, Telefon). The Google-Maps embed was removed (CSP `frame-src 'none'`). **Mail delivery: the form posts CLIENT-SIDE directly to Web3Forms** (`api.web3forms.com/submit`; `WEB3FORMS_ACCESS_KEY` constant in ContactPage.tsx — a **public** client-side key by design), which forwards the submission as email to the recipient configured in the Web3Forms dashboard (must be `info@puron-media.de`, added + verified under *Linked Emails*). **Why this route:** the user has **mailbox access but no DNS/domain and isn't M365 admin** — so Resend domain-verification and Microsoft Graph were both out; Web3Forms verifies via the *inbox*. Web3Forms' **free plan only accepts browser submissions** (a server-side relay needs Pro — that relay code still exists dormant in [index.ts](supabase/functions/make-server-1fdc8e05/index.ts) `web3Key` branch but is unused). End-to-end verified 2026-06-24 (browser submit → "Vielen Dank"). **The `POST /contact` edge endpoint is no longer used by the form** (it still serves `/google-reviews`; its `CONTACT_*`/Resend/Graph secrets are now vestigial for the form). CSP `connect-src` now includes `https://api.web3forms.com` (both [vite.config.ts](vite.config.ts) meta + [public/_headers](public/_headers)); Datenschutz §3 names Web3Forms as the processor ([PrivacyPage.tsx](src/app/components/pages/PrivacyPage.tsx)). WhatsApp is also a floating FAB on every page ([WhatsAppButton.tsx](src/app/components/WhatsAppButton.tsx)); the wa.me link lives in [src/app/whatsapp.ts](src/app/whatsapp.ts).

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
  styles/                   ← fonts.css (now just a note — fonts load via a <link> in index.html, not @import, to avoid a request waterfall); tailwind.css; theme.css (shadcn tokens — see §5)
  app/
    api.ts                  ← shared SUPABASE_FUNCTION_URL constant for all backend calls
    App.tsx                 ← <ErrorBoundary><MotionConfig reducedMotion="user"><RouterProvider/></...></...>
    routes.tsx              ← all routes; Layout is parent, pages are leaves
    hooks/
      usePageTitle.ts       ← effect-based <title> manager (auto-restores on unmount)
    components/
      ErrorBoundary.tsx     ← class boundary + PageErrorFallback. Wrapped at app root + around each canvas.
      Layout.tsx            ← fixed nav + footer + <ErrorBoundary><AnimatedBackground/></...> + <Outlet/>
      AnimatedBackground.tsx← full-screen canvas (rotating particle sphere, auroras [desktop only], dust)
                              — pauses on document.hidden, single static frame on prefers-reduced-motion.
                              On mobile it runs CONTINUOUSLY but caps the *repaint* to ~30fps (delta-time
                              loop, so drift speed is identical at 30 or 60fps) so the full-viewport canvas
                              stops competing with scroll compositing. This REPLACED an earlier "freeze the
                              canvas while scrolling" hack that stopped the rAF loop on every scroll event —
                              momentum scrolling kept it frozen, so the backdrop visibly hung while scrolling
                              (user-reported 2026-06-05). The delta-time loop also makes drift frame-rate
                              independent on desktop (no longer 2× faster on 120Hz displays).
      Hero3DVisual.tsx      ← per-page canvas (solar-system) used only on HomePage, lg+ only — pauses on prefers-reduced-motion, tab-hidden, AND when scrolled offscreen (IntersectionObserver; also stops the wasted loop on mobile where it's display:none)
      AnimatedButton.tsx    ← THE button component. Every CTA goes through it (variants: primary/secondary/outline/nav/ghost)
      WhatsAppButton.tsx    ← floating WhatsApp FAB (brand green #25D366) with a motion-safe attention pulse + hover label, fixed bottom-right on every page (mounted in Layout). Opens the wa.me link from src/app/whatsapp.ts. Link navigation needs NO CSP change (it's not a resource load).
      PuronLogo.tsx         ← inline SVG hex logo (the symbol only; the "PURON MEDIA" lettering is the raster public/wordmark.png, see Layout.tsx)
      GoogleReviewCard.tsx, useGoogleReviews.ts  ← live reviews integration (the card's backdrop-blur is gated to md+ — re-sampling a blur over the live canvas every frame is too costly while scrolling on phones)
      figma/ImageWithFallback.tsx  ← <img> wrapper with placeholder on error; defaults to loading="lazy" + decoding="async"
      sections/             ← section components composed by HomePage (HeroSection, ClientTicker, ServicesPreview, SelectedWorks, GoalsSection, WhyPuronSection, InstagramReels, SocialProof, ContactCta)
                              — ClientTicker + SocialProof run GPU CSS-transform marquees that PAUSE
                              off-screen via IntersectionObserver: a `data-active` attr on the wrap toggles
                              animation-play-state + applies `will-change:transform` only while visible
                              (avoids a permanently-promoted, always-ticking compositor layer). Their
                              backdrop-blur is gated to md+. SocialProof also wraps the skeleton/empty/carousel
                              in one fixed min-height box so the data swap can't reflow the page mid-scroll.
                              SocialProof's marquee ALSO pauses during active scroll on mobile (a `data-scrolling`
                              attr toggled imperatively on the wrap — no React re-render — pauses
                              animation-play-state, resumes ~180ms after scroll stops), and its section bg is
                              opaque on mobile (`from-[#0A0A0D] to-[#111116]`, translucent only at md+): both
                              stop this section's marquee + the now-continuous full-screen background canvas
                              (see AnimatedBackground) from compounding GPU load and hanging the scroll past it.
      CustomCursor.tsx      ← replaces the OS pointer with the Puron hex logo on fine-pointer devices. Mounted at App.tsx root. Hidden on touch + skips scale-up on prefers-reduced-motion. CSS in [src/styles/cursor.css](src/styles/cursor.css) hides the native cursor via `.custom-cursor-active` on <html>.
      pages/                ← one component per route (HomePage, ServicesPage, ProjectsPage, TeamPage, ContactPage, ImprintPage, PrivacyPage, NotFoundPage)
public/
  favicon.svg               ← Puron logo as SVG favicon
  logo.png                  ← rasterized 256×256 logo for emails (built via [scripts/svg-to-png.mjs](scripts/svg-to-png.mjs))
  wordmark.png              ← 841×232 transparent "PURON MEDIA" lettering shown next to the hex symbol in the nav + footer ([Layout.tsx](src/app/components/Layout.tsx)). Client-supplied brand image, used 1:1 instead of CSS text.
  manifest.webmanifest      ← PWA manifest
  robots.txt                ← Allow all
  _headers                  ← Netlify/Cloudflare Pages security headers (see §9)
  reels/                    ← Cover images for the Instagram-reels grid on HomePage. Real covers are `reel-1.jpg`…`reel-3.jpg` (one per reel, in order); `placeholder-1..4.svg` remain as the on-error fallback. To add/replace a cover, drop `reel-N.jpg` here matching the entry order in [InstagramReels.tsx](src/app/components/sections/InstagramReels.tsx).
  partners/                 ← Partner logos for the ClientTicker marquee.
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
| Fonts | `Inter` (body), `Space Grotesk` (display) | loaded via a Google Fonts `<link>` (with preconnect) in [index.html](index.html) |

When adding UI, copy this convention rather than reaching for `bg-primary`/`text-foreground`. Note: [index.html](index.html) sets `<html class="dark">` so the theme.css `.dark` variant is the one that applies.

### Backend (Edge Function endpoints)

The Hono handler in [supabase/functions/make-server-1fdc8e05/index.ts](supabase/functions/make-server-1fdc8e05/index.ts) exposes two endpoints, both prefixed with `/make-server-1fdc8e05`. The frontend uses the shared base URL from [src/app/api.ts](src/app/api.ts) (`SUPABASE_FUNCTION_URL`).

**`GET /google-reviews`** — fetches live Google Places reviews.
1. Reads `GOOGLE_PLACES_API_KEY` from Deno env.
2. Resolves the Place ID for `"Puron Media Meschede"` via Places API (New) `places:searchText` and caches it forever in KV (`google_reviews:puron_media_meschede:place_id`).
3. Fetches place details (`rating`, `userRatingCount`, `googleMapsUri`, `reviews[]`) with `languageCode=de`.
4. Caches the normalized payload in KV (`google_reviews:puron_media_meschede`) for **1 hour**, but **only on success with at least one review** — error states never poison the cache. Error responses return a generic German message only — they **never** echo the upstream Google body / exception text (avoids leaking API-key/quota diagnostics to callers). There is **no `?force=1` cache-bypass** anymore — it was a public, unauthenticated way to hammer the *paid* Places API, so it was removed. To bust the cache manually, delete the `google_reviews:puron_media_meschede` row in the Supabase KV table.

**`POST /contact`** — accepts contact-form submissions and forwards them via Resend.
1. Validates required fields (`name`, `email`, `message`), enforces length limits, and checks `goal` against a whitelist.
2. **Honeypot**: if the hidden `website` field has any value, returns `200 OK` silently without sending — bots see success and don't learn the field name.
3. **Per-IP rate limit**: max 3 submissions per IP per hour, tracked in KV under `contact_rl:<ip>`. IP comes from `CF-Connecting-IP` or `X-Forwarded-For`.
4. Sends a formatted HTML email via the Resend API to `CONTACT_EMAIL_TO` (default `Tolunay.u@outlook.de`) from `CONTACT_EMAIL_FROM` (default `onboarding@resend.dev`). `reply_to` is set to the submitter's email. The template is **hardened against forced dark-mode inversion** (the Gmail mobile app especially — it ignores `color-scheme`/`prefers-color-scheme` and remaps colors with its own algorithm, which previously turned the white hero heading invisible and flipped the cards to light lavender). Hardening: the hero is a flat solid `#1E1530` (NO CSS gradient — gradients can't be inverted so the bg stayed dark while Gmail darkened the text → invisible); all surfaces are a uniform near-black (`#120C1E` card / `#181030` rows+message / `#150E26` panel) so no block reads as a "light card" to flip; every background is set via both the `bgcolor` attribute AND inline CSS (Outlook/Word); the message box is a single-cell `<table>` (`bgcolor` on a `<div>` is invalid in Outlook); text is off-pure `#fffffe` (dodges Apple Mail's exact-match #fff/#000 swap); accent links are `#C39BFF`; and the `<head>` carries a `<style>` with `:root{color-scheme:dark}` + `@media (prefers-color-scheme:dark)` + `[data-ogsc]/[data-ogsb]` overrides driven by class hooks `.hero/.card/.row/.panel/.heading/.body-text/.muted/.accent/.btn/.btn-a` (so every element re-pinned MUST keep its class). The CTA is a VML `<v:roundrect>` for Outlook desktop + a non-MSO `<a>` fallback. **If the hero heading still darkens in the Gmail app** after this, the documented last-resort is a surgical `u + .body` mix-blend-mode double-invert wrapped around that one `<h1>` (fragile — apply only to the heading, never blanket-wrap).
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

**Mail provider for `/contact`:** the handler **auto-selects Microsoft Graph** when `MS_TENANT_ID` + `MS_CLIENT_ID` + `MS_CLIENT_SECRET` are all set, otherwise it falls back to **Resend** ([index.ts](supabase/functions/make-server-1fdc8e05/index.ts) — `useGraph` branch). Graph is the chosen path for `info@puron-media.de` (sends straight through the Microsoft 365 / Exchange mailbox via app-only OAuth + `users/{sender}/sendMail` over HTTPS — no SMTP AUTH, no mailbox password). The Graph code shipped + deployed 2026-06-24 but stays dormant (Resend fallback → still 502) **until the three `MS_*` secrets are set**; once they are, it activates with no redeploy.

Variables (set in `supabase/.env`):
- `GOOGLE_PLACES_API_KEY` — required for `/google-reviews`
- `MS_TENANT_ID` / `MS_CLIENT_ID` / `MS_CLIENT_SECRET` — Azure AD app registration (Microsoft Graph **Application** permission `Mail.Send` + admin consent; client-secret VALUE). When all three are set, `/contact` sends via Microsoft 365. `MS_SENDER` (optional) = mailbox to send AS, defaults to `CONTACT_EMAIL_TO`. Keep `CONTACT_EMAIL_TO=info@puron-media.de`. Setting these is the live activation step — no redeploy, secrets apply within moments.
- `RESEND_API_KEY` — fallback mail provider for `/contact` (used only when the `MS_*` secrets are absent). Currently a **restricted, send-only** key.
- `CONTACT_EMAIL_TO` (optional, default `Tolunay.u@outlook.de`). Change it with `supabase secrets set "CONTACT_EMAIL_TO=…" --project-ref fhgevybapodhubkuylnw` (takes effect immediately, no redeploy). **⚠️ Resend test-mode trap:** while `CONTACT_EMAIL_FROM` is still `onboarding@resend.dev` (Resend's shared, unverified sender), Resend will **only deliver to the email address of the Resend account itself** — sending to any other recipient is rejected with a 403, which surfaces as `POST /contact → 502` and the German UI error *"E-Mail konnte nicht gesendet werden…"* (the `!resendRes.ok` branch, [index.ts](supabase/functions/make-server-1fdc8e05/index.ts) ~L515). This bit us 2026-06-02: setting `CONTACT_EMAIL_TO=info@puron-media.de` broke the form because info@ isn't the Resend account address. To send to an arbitrary recipient you MUST first verify a sending domain in Resend (next bullet). Diagnostic: health is 200 but `POST /contact` returns 502 → it's Resend rejecting, not `verify_jwt`.
- `CONTACT_EMAIL_FROM` — **live value is `onboarding@resend.dev`** (Resend's shared test sender), paired with `CONTACT_EMAIL_TO=tolunayusul@gmail.com` (the quick path — see §1 blockquote). To move delivery to `info@puron-media.de`: verify `puron-media.de` at resend.com/domains (records on `resend._domainkey` DKIM TXT, `send.` SPF TXT + return-path MX, optional `_dmarc` DMARC — all **subdomains**, no conflict with the apex M365 SPF/MX or GitHub-Pages A records), **then** set `CONTACT_EMAIL_FROM=noreply@puron-media.de` + `CONTACT_EMAIL_TO=info@puron-media.de`. Secret changes need a `supabase functions deploy …` to force fresh isolates to pick them up (a warm isolate keeps its boot-time env — observed 2026-06-24).
- `ALLOWED_ORIGINS` (optional, default `*`) — comma-separated allow-list. **Now SET (2026-06-23) to `https://puron-media.de,https://www.puron-media.de`** (pushed via `supabase secrets set`), so a browser on any other origin gets no `Access-Control-Allow-Origin` and can't POST to `/contact`. Verified live: a preflight from `puron-media.de` is reflected, one from a foreign origin is not. (hono `cors` only reflects an Origin that's in the list — note this is browser-enforced; combine with the honeypot + per-IP rate limit for non-browser clients.)

After editing the function code in this repo, redeploy via Supabase CLI:

```bash
supabase functions deploy make-server-1fdc8e05 --project-ref fhgevybapodhubkuylnw --no-verify-jwt
```

`--no-verify-jwt` keeps the endpoints public (matches current production behaviour). Without it, Supabase enforces JWT verification on the function and the marketing site can't reach it.

> **`verify_jwt` is now pinned in [supabase/config.toml](supabase/config.toml)** (`[functions.make-server-1fdc8e05] verify_jwt = false`). With that file present, a plain `supabase functions deploy …` keeps the function public — the `--no-verify-jwt` flag is belt-and-suspenders, not load-bearing. **This was added after an incident:** a redeploy without the flag re-enabled JWT verification, and the gateway started returning `401 UNAUTHORIZED_NO_AUTH_HEADER` to every request → the live site showed no Google reviews and the contact form couldn't send (both endpoints share this one function). Symptom signature: `curl -i .../functions/v1/make-server-1fdc8e05/health` returns `401` with `x-served-by: supabase-edge-runtime` (the platform gateway, *before* the Hono app runs) → it's a `verify_jwt` problem, not an app-code bug. **Caveat:** the **Dashboard** "Deploy" button still defaults JWT *on* and ignores config.toml — prefer the CLI, or toggle it back off in the function's settings if you deploy via the Dashboard.

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

[public/_headers](public/_headers) ships a Netlify / Cloudflare Pages compatible header file with HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy, and a strict Referrer-Policy. The CSP allows: self, Google Fonts, Unsplash images, Google profile photos, and (in `connect-src`) the Supabase Edge Function origin + `https://api.web3forms.com` (the contact form posts there client-side) — and forbids inline `<script>` (allows inline `style` because motion + section keyframes need it). It also sets `object-src 'none'`, `frame-src 'none'` (no third-party iframes — the Google-Maps embed was removed 2026-06-23), `frame-ancestors 'none'`, `Cross-Origin-Opener-Policy: same-origin`, and `upgrade-insecure-requests`. **If you add an iframe/embed again, widen `frame-src` accordingly in BOTH [public/_headers](public/_headers) and the vite meta CSP ([vite.config.ts](vite.config.ts)).**

**CSP also ships as a build-time `<meta>` tag** (the `inject-security-meta` plugin in [vite.config.ts](vite.config.ts)) so the GitHub Pages deployment — which ignores `_headers` — still gets a CSP + `Referrer-Policy`. The plugin is `apply: 'build'`, so it never runs in `pnpm dev` (a strict `script-src`/`connect-src` would break Vite's HMR eval + websocket). Keep the meta CSP directives in sync with `_headers` when you change either. Caveat: `frame-ancestors` / `X-Frame-Options` and `HSTS` **cannot** be delivered via `<meta>`, so clickjacking + HSTS protection still require real HTTP headers (i.e. Netlify/Cloudflare Pages, not GitHub Pages).

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
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://*.googleusercontent.com; connect-src 'self' https://fhgevybapodhubkuylnw.supabase.co; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" }
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

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds + deploys on every push to `main` via `actions/deploy-pages`. The site is live on the **custom apex domain `https://puron-media.de`** (migrated 2026-06-02 from the old `chaos20140.github.io/Puron` subpath).

Because it serves from root, the workflow **no longer sets `GHP_BASE`** — Vite defaults `base` to `/` ([vite.config.ts](vite.config.ts)), and React Router reads the same value via `import.meta.env.BASE_URL` for its `basename`. [public/CNAME](public/CNAME) contains `puron-media.de`; it gets copied into the build artifact so the Pages custom-domain setting survives every Actions deploy (without it, an Actions deploy can reset the domain). The custom domain itself is configured in repo **Settings → Pages**, and DNS must point the apex at GitHub Pages (A records `185.199.108–111.153` + AAAA `2606:50c0:8000–8003::153`); "Enforce HTTPS" should be on.

> To revert to the project-subpage build (e.g. for a PR preview), set `GHP_BASE: /Puron/` back on the `pnpm build` step and remove `public/CNAME`.

SEO assets tied to the domain are committed: `<link rel="canonical">` + `og:url` + `og:image`/`twitter:image` (→ `/logo.png`) in [index.html](index.html), [public/sitemap.xml](public/sitemap.xml) (all 7 routes), and a `Sitemap:` line in [public/robots.txt](public/robots.txt). The site/brand name in [index.html](index.html) + [manifest.webmanifest](public/manifest.webmanifest) was corrected from "Puron **Agency**" to "Puron **Media**" to match the wordmark/email/domain. The contact-email template ([supabase/functions/make-server-1fdc8e05/index.ts](supabase/functions/make-server-1fdc8e05/index.ts)) logo `<img>` + footer link now point to `https://puron-media.de` — **this needs a function redeploy to take effect** (see §7).

Still to do on the Supabase side after launch (neither is in this repo): redeploy the edge function for the new email URLs, and set `ALLOWED_ORIGINS` to `https://puron-media.de` to lock the `/contact` endpoint (currently default `*`) — see §7.

Note: GitHub Pages **ignores `public/_headers`**, so HTTP-header-only protections (HSTS, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`) won't apply there. The CSP + `Referrer-Policy` are still delivered via the build-time `<meta>` injection (see above), so the main XSS vectors are covered — but for full clickjacking + HSTS protection deploy to Netlify or Cloudflare Pages instead.
