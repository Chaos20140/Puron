# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Maintenance rule (per user request):** Whenever you change anything in this repo, update this file in the same turn so it stays in sync — paths, commands, behaviours, known issues. If a section here becomes wrong, fix it; do not leave stale guidance behind.

## 1. What this project is

Marketing one-pager + sub-pages for **Puron Media (Meschede)**, a German social-media agency. It is a single-page React app generated initially in [Figma Make](https://www.figma.com/design/8kTJdiApN2rWkNNCjgVfPH/Puron) and then ejected — that origin explains some of the quirks below. All UI copy is **German**; only code/comments are English.

The site has one piece of live data: a Google Places "reviews" widget on the home page, served by a Supabase Edge Function.

## 2. Stack at a glance

| Layer | Choice |
|---|---|
| Build | Vite 6 + `@vitejs/plugin-react` |
| UI | React 18.3 + TypeScript (strict, see §3) |
| Routing | `react-router` **v7** (`createBrowserRouter`, file [src/app/routes.tsx](src/app/routes.tsx)) |
| Styling | Tailwind CSS **v4** via `@tailwindcss/vite` (no `tailwind.config.*`; sources declared in [src/styles/tailwind.css](src/styles/tailwind.css) with `@source`) |
| Animations | `motion` (Framer Motion successor) + two hand-rolled `<canvas>` scenes |
| Component kit | shadcn/ui copies under `src/app/components/ui/` (Radix-based) |
| Package manager | **pnpm** (use `corepack pnpm …` if pnpm isn't on PATH; `npm install` will fail because of the lockfile format) |
| Backend | Supabase Edge Function (Deno + Hono) at [supabase/functions/server/index.tsx](supabase/functions/server/index.tsx), backed by a Postgres KV table `kv_store_1fdc8e05` |

Peer deps mark `react`/`react-dom` optional — they get hoisted from the resolved deps tree. Do not "fix" this by promoting them to `dependencies` unless you understand the Figma Make packaging contract.

## 3. Commands

```bash
pnpm install          # install (use `corepack pnpm install` if pnpm isn't on PATH)
pnpm dev              # vite dev server on http://localhost:5173
pnpm build            # production build → dist/
pnpm preview          # serve the built dist/ locally to smoke-test
pnpm typecheck        # tsc --noEmit (see tsconfig.json — strict mode, src/ only)
```

There is no `lint` or `test` script. The Edge Function deploys via the Supabase CLI / dashboard; this repo has no deploy script for it.

`tsconfig.json` covers only `src/`. The `supabase/functions/**` code uses Deno-specific imports (`npm:hono`, `jsr:@supabase/...`, `Deno.env`) and is intentionally excluded from `tsc`.

## 4. Architecture / mental model

### Frontend
```
src/
  main.tsx                ← creates root, imports styles/index.css
  styles/                 ← fonts.css → Google Fonts; tailwind.css; theme.css (shadcn tokens — see §5)
  app/
    App.tsx               ← <RouterProvider router={router}/>
    routes.tsx            ← all routes; Layout is parent, pages are leaves, "*" is inline 404
    components/
      Layout.tsx          ← fixed nav + footer + <AnimatedBackground/> + <Outlet/>
      AnimatedBackground.tsx  ← full-screen canvas (rotating particle sphere, auroras, dust). Mounts ONCE in Layout.
      Hero3DVisual.tsx    ← per-page canvas (solar-system) used only on HomePage, lg+ only
      AnimatedButton.tsx  ← THE button component. Every CTA goes through it (variants: primary/secondary/outline/nav/ghost)
      PuronLogo.tsx       ← inline SVG hex logo
      GoogleReviewCard.tsx, useGoogleReviews.ts  ← live reviews integration
      figma/ImageWithFallback.tsx  ← <img> wrapper that swaps in a placeholder SVG on error
      pages/              ← one component per route (HomePage, ServicesPage, ProjectsPage, TeamPage, ContactPage, ImprintPage, PrivacyPage)
      ui/                 ← shadcn primitives. Treat as vendored — don't hand-edit unless you know what you're doing.
```

Routes (defined in [src/app/routes.tsx](src/app/routes.tsx)):
`/` (Home) · `/services` · `/projects` · `/team` · `/contact` · `/imprint` · `/privacy` · `*` (inline 404)

Because the router is a **browser** router, any host serving the production build must rewrite unknown paths to `index.html`.

### Design system (de-facto, not enforced anywhere)
The project does **not** use the shadcn theme tokens for the hand-built pages. Pages use raw Tailwind arbitrary-value classes with hard-coded hex literals everywhere. The recurring palette:

| Token | Hex | Used for |
|---|---|---|
| Background base | `#0A0A0D`, `#050508`, `#121217`, `#111116` | page/card surfaces (varying opacity) |
| Foreground | `#F5F5F7` | primary text |
| Muted text | `#B3B3C2`, `#71717A` | secondary text |
| Brand purple | `#7C3AED` (deep), `#A855F7` (bright) | accents, gradients, glows |
| Borders | `white/5`, `white/10` | hairlines |
| Fonts | `Inter` (body), `Space Grotesk` (display) | imported via Google Fonts in [src/styles/fonts.css](src/styles/fonts.css) |

When adding UI, copy this convention rather than reaching for `bg-primary`/`text-foreground`. Note: [index.html](index.html) sets `<html class="dark">` so the theme.css `.dark` variant is the one that applies — if you DO use shadcn primitives they'll render in dark mode and stay visually consistent.

### Backend (Google Reviews flow)
1. `useGoogleReviews()` (frontend hook) calls `https://fhgevybapodhubkuylnw.supabase.co/functions/v1/make-server-1fdc8e05/google-reviews` (no `?force=1` — the 1-hour cache is intentional). Add `?force=1` manually only when debugging stale data.
2. The Hono handler in [supabase/functions/server/index.tsx](supabase/functions/server/index.tsx):
   - Reads `GOOGLE_PLACES_API_KEY` from Deno env.
   - Looks up the Place ID for the literal string `"Puron Media Meschede"` via Places API (New) `places:searchText`, caches it forever in KV (`google_reviews:puron_media_meschede:place_id`).
   - Fetches place details (`rating`, `userRatingCount`, `googleMapsUri`, `reviews[]`) with `languageCode=de`.
   - Caches the normalized payload in KV (`google_reviews:puron_media_meschede`) for **1 hour**, but **only on success with at least one review** — error states never poison the cache.
   - `?force=1` bypasses the read-cache (still writes to it).
3. KV is a thin wrapper over a single Postgres table `kv_store_1fdc8e05` with `(key TEXT PK, value JSONB)` (see [supabase/functions/server/kv_store.tsx](supabase/functions/server/kv_store.tsx)).

## 5. Known issues / footguns (read before changing things)

The original audit listed 11 issues. Items 1–9 from the audit have been **fixed** (see git history). What remains:

1. **shadcn theme variables are inert for hand-built pages.** [src/styles/theme.css](src/styles/theme.css) defines a full light/dark CSS-variable system, but the entire app uses hex literals directly. Only the vendored `ui/*` shadcn components consume the tokens, and pages barely use those. Since `<html class="dark">` is set, anything new pulled from shadcn will render in dark mode and look right — but tweaks to `theme.css` will have no visible effect on the existing hand-built UI.
2. **`AnimatedBackground` reads `window.innerWidth` only at mount** to decide particle counts; rotating a phone keeps the original count. Acceptable trade-off, just don't be surprised.
3. **Don't lower the `AnimatedBackground` canvas z-index below 0.** It's `position: fixed; z-index: 0`. The body has a dark background (`#0A0A0D` inline + theme.css `bg-background` in dark mode) to kill the white-flash on initial load. A negative z-index puts the canvas *behind* the body background — invisible. Page content stays visible because nav is `z-50` and `main`/`footer` are `z-10` (both above the canvas).
3. **`pnpm-workspace.yaml` lists `.` as a workspace** and `package.json` is named `@figma/my-make-file`. Both are leftovers from the Figma Make template. Renaming is cosmetic; safe but not necessary.
4. **No tests, no linter, no CI.** `pnpm build` and `pnpm typecheck` are the only safety nets. Run typecheck before committing if you change types.
5. **CORS on the edge function is wildcard `*`** — intentional and documented in [supabase/functions/server/index.tsx](supabase/functions/server/index.tsx) because the endpoint is public, read-only, and returns no PII. If you ever add an authenticated/mutating route, lock `origin` down to the marketing site's domain before deploying.

### What was fixed (so future-you doesn't "fix" them again)
- `?force=1` is no longer hard-coded into [src/app/components/useGoogleReviews.ts](src/app/components/useGoogleReviews.ts) — the cache works on every page load now.
- The dead `utils/supabase/info.tsx` file (and `utils/` directory) advertised the wrong Supabase project ID and was unimported. Deleted.
- The `figma-asset-resolver` Vite plugin pointed at a non-existent `src/assets/` and had no callers. Removed from [vite.config.ts](vite.config.ts).
- The 63 KB Figma-export dump at `src/imports/pasted_text/index.html` (and `src/imports/`) was unreferenced. Deleted.
- [index.html](index.html) was `lang="en"` on a 100% German site — now `lang="de"`. It also now declares `class="dark"` and a dark `<style>` body background to kill the white flash on initial load before the canvas paints.
- The two extra blurred radial `<div>`s in `Layout.tsx` were redundant with `AnimatedBackground` — removed.
- `tsconfig.json` is committed (strict mode, `src/` only) and `pnpm typecheck` runs `tsc --noEmit`. The codebase passes strict typecheck — keep it that way.
- `typescript`, `@types/react@18`, `@types/react-dom@18` are now explicit devDependencies (the previously hoisted `@types/react@19` was a transitive mismatch with React 18).
- The edge function's CORS allow-methods list was tightened to `GET, OPTIONS` (was `GET, POST, PUT, DELETE, OPTIONS`) since the function only exposes GET endpoints.

## 6. Conventions worth preserving

- **All CTAs go through `<AnimatedButton>`.** Don't introduce raw `<button>`/`<a>` for primary actions — pick a variant (`primary | secondary | outline | nav | ghost`) and pass `to=` (Link), `href=` (external), or `onClick=`.
- **Page sections** are typically wrapped in `motion.div` with `initial / whileInView / viewport={{ once: true }}` for scroll-in fades. Match this pattern when adding new sections so the feel stays consistent.
- **Page top padding** is always `pt-24 md:pt-32` to clear the fixed `h-16 md:h-20` nav. New pages should follow this or the hero will end up under the nav bar.
- **`isolation: "isolate"`** is set on most major sections. This creates a new stacking context so the absolute-positioned glow blobs don't bleed into other sections — keep it when copying section markup.
- **No comments in code unless explaining WHY.** The codebase already follows this; respect it.

## 7. Edge-function changes

The Edge Function lives at [supabase/functions/server/index.tsx](supabase/functions/server/index.tsx) and is deployed to the `fhgevybapodhubkuylnw` project under the function slug **`make-server-1fdc8e05`** (so its full URL ends in `/functions/v1/make-server-1fdc8e05/...`). To redeploy you need the Supabase CLI logged into that project; this repo has no script for it. The function requires the `GOOGLE_PLACES_API_KEY` env var — set it via the Supabase dashboard's Function Secrets.
