import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

// Tiny Deno global declaration so editors that treat this file with the
// browser-targeted tsconfig don't flag every Deno.* reference. The actual
// runtime types come from Supabase Edge Functions (Deno).
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// CORS allow-list is read from the `ALLOWED_ORIGINS` env var, which is a
// comma-separated list of fully-qualified origins (e.g.
// "https://puron.agency,https://www.puron.agency"). When the var is missing
// or set to "*", we fall back to fully open CORS — that's safe for the
// /google-reviews endpoint (read-only, no PII), but you SHOULD pin it to
// the production domain(s) before going live so /contact (POST) can't be
// abused by other sites embedding it.
const rawAllowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "*").trim();
const allowedOrigins: string | string[] = rawAllowedOrigins === "*"
  ? "*"
  : rawAllowedOrigins.split(",").map((s: string) => s.trim()).filter(Boolean);

app.use(
  "/*",
  cors({
    origin: allowedOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1fdc8e05/health", (c) => {
  return c.json({ status: "ok" });
});

// Google Reviews endpoint — fetches live reviews from Google Places API (New)
// for "Puron Media Meschede" with KV caching.
const REVIEWS_CACHE_KEY = "google_reviews:puron_media_meschede";
const PLACE_ID_CACHE_KEY = "google_reviews:puron_media_meschede:place_id";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function resolvePlaceId(apiKey: string): Promise<string> {
  const cached = await kv.get(PLACE_ID_CACHE_KEY);
  if (cached && typeof cached === "string") return cached;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: "Puron Media Meschede" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places searchText failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const placeId = data?.places?.[0]?.id;
  if (!placeId) {
    throw new Error(`No place found for "Puron Media Meschede". Response: ${JSON.stringify(data)}`);
  }
  await kv.set(PLACE_ID_CACHE_KEY, placeId);
  return placeId;
}

app.get("/make-server-1fdc8e05/google-reviews", async (c) => {
  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.log("GOOGLE_PLACES_API_KEY env var is missing while fetching Google reviews");
      return c.json({ error: "Missing GOOGLE_PLACES_API_KEY" }, 500);
    }

    const force = c.req.query("force") === "1";
    const cached = await kv.get(REVIEWS_CACHE_KEY) as
      | { fetchedAt: number; payload: unknown }
      | null;

    if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return c.json({ ...((cached.payload ?? {}) as object), cached: true });
    }

    const placeId = await resolvePlaceId(apiKey);

    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
        },
      },
    );

    if (!detailsRes.ok) {
      const text = await detailsRes.text();
      console.log(`Places details failed (${detailsRes.status}) for placeId=${placeId}: ${text}`);
      // IMPORTANT: never cache error responses. Return error directly.
      return c.json({ error: `Places details failed: ${detailsRes.status}`, details: text }, 502);
    }

    const data = await detailsRes.json();
    const reviews = Array.isArray(data?.reviews)
      ? data.reviews.map((r: any) => ({
          author: r?.authorAttribution?.displayName ?? "Anonym",
          authorPhoto: r?.authorAttribution?.photoUri ?? null,
          authorUri: r?.authorAttribution?.uri ?? null,
          rating: r?.rating ?? 5,
          text: r?.originalText?.text ?? r?.text?.text ?? "",
          relativeTime: r?.relativePublishTimeDescription ?? "",
          publishTime: r?.publishTime ?? null,
        }))
      : [];

    const payload = {
      placeId,
      name: data?.displayName?.text ?? "Puron Media",
      rating: data?.rating ?? null,
      userRatingCount: data?.userRatingCount ?? null,
      googleMapsUri: data?.googleMapsUri ?? null,
      reviews,
      fetchedAt: Date.now(),
    };

    // Only cache when we actually got reviews back from Google.
    // This guarantees error states (403, API_KEY_INVALID, REQUEST_DENIED, …)
    // never poison the cache, and a successful ?force=1 call overwrites
    // the stored payload so later non-force calls also return real reviews.
    if (reviews.length > 0) {
      await kv.set(REVIEWS_CACHE_KEY, { fetchedAt: Date.now(), payload });
    }

    return c.json({ ...payload, cached: false });
  } catch (error) {
    console.log(`Unexpected error in /google-reviews: ${error instanceof Error ? error.stack ?? error.message : error}`);
    // IMPORTANT: never cache error responses. Return error directly.
    return c.json({ error: "Failed to fetch Google reviews", details: String(error) }, 500);
  }
});

// Contact form endpoint — accepts a POST from the marketing site's
// /contact page, validates input, applies a per-IP rate limit (KV-backed),
// and forwards the submission to the configured recipient via Resend.
//
// Required env vars:
//   - RESEND_API_KEY            (set in Supabase Function Secrets)
// Optional env vars:
//   - CONTACT_EMAIL_TO          (default: Tolunay.u@outlook.de)
//   - CONTACT_EMAIL_FROM        (default: onboarding@resend.dev)
const CONTACT_RATE_LIMIT_PREFIX = "contact_rl:";
const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CONTACT_RATE_LIMIT_MAX = 3;

const ALLOWED_GOALS = new Set([
  "",
  "Mehr Kunden",
  "Mehr Bewerber",
  "Mehr Sichtbarkeit",
  "Stärkeres Markenimage",
  "Noch nicht sicher",
]);

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function singleLine(s: string, max = 200): string {
  return s.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

app.post("/make-server-1fdc8e05/contact", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ error: "Ungültige Anfrage." }, 400);
    }

    const {
      name,
      email,
      company,
      message,
      goal,
      website, // honeypot — must be empty
    } = body as Record<string, unknown>;

    // Honeypot tripped → silently 200 so bots don't learn the field name.
    if (typeof website === "string" && website.trim() !== "") {
      console.log("contact: honeypot tripped, silently accepting");
      return c.json({ ok: true });
    }

    // Required-field + format validation.
    if (typeof name !== "string" || !name.trim() || name.length > 100) {
      return c.json({ error: "Bitte gib einen Namen an (max. 100 Zeichen)." }, 400);
    }
    if (
      typeof email !== "string"
      || !email.trim()
      || email.length > 200
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return c.json({ error: "Bitte gib eine gültige E-Mail-Adresse an." }, 400);
    }
    if (company !== undefined && company !== null && company !== "") {
      if (typeof company !== "string" || company.length > 100) {
        return c.json({ error: "Firmenname ist zu lang (max. 100 Zeichen)." }, 400);
      }
    }
    if (typeof message !== "string" || !message.trim() || message.length > 2000) {
      return c.json({ error: "Bitte beschreibe dein Anliegen (max. 2000 Zeichen)." }, 400);
    }
    if (goal !== undefined && goal !== null) {
      if (typeof goal !== "string" || !ALLOWED_GOALS.has(goal)) {
        return c.json({ error: "Ungültiges Ziel ausgewählt." }, 400);
      }
    }

    // Per-IP rate limiting via KV.
    const ip = c.req.header("CF-Connecting-IP")
      || c.req.header("X-Forwarded-For")?.split(",")[0]?.trim()
      || "unknown";
    const rlKey = CONTACT_RATE_LIMIT_PREFIX + ip;
    const rlEntry = await kv.get(rlKey) as
      | { count: number; resetAt: number }
      | null;
    const now = Date.now();
    if (rlEntry && rlEntry.resetAt > now) {
      if (rlEntry.count >= CONTACT_RATE_LIMIT_MAX) {
        return c.json(
          { error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut." },
          429,
        );
      }
      await kv.set(rlKey, { count: rlEntry.count + 1, resetAt: rlEntry.resetAt });
    } else {
      await kv.set(rlKey, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("contact: RESEND_API_KEY env var missing");
      return c.json(
        { error: "E-Mail-Versand ist gerade nicht konfiguriert. Bitte später erneut versuchen." },
        500,
      );
    }

    const recipient = Deno.env.get("CONTACT_EMAIL_TO") || "Tolunay.u@outlook.de";
    const sender = Deno.env.get("CONTACT_EMAIL_FROM") || "onboarding@resend.dev";

    const cleanName = singleLine(name, 100);
    const cleanEmail = singleLine(email, 200);
    const cleanCompany = typeof company === "string" ? singleLine(company, 100) : "";
    const cleanGoal = typeof goal === "string" ? goal : "";
    const cleanMessage = message.trim().slice(0, 2000);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px;">
        <h2 style="color: #7C3AED;">Neue Anfrage über das Puron-Kontaktformular</h2>
        <table cellpadding="6" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 16px;">
          <tr><td><strong>Name:</strong></td><td>${escapeHtml(cleanName)}</td></tr>
          <tr><td><strong>E-Mail:</strong></td><td>${escapeHtml(cleanEmail)}</td></tr>
          <tr><td><strong>Unternehmen:</strong></td><td>${escapeHtml(cleanCompany || "—")}</td></tr>
          <tr><td><strong>Primäres Ziel:</strong></td><td>${escapeHtml(cleanGoal || "—")}</td></tr>
        </table>
        <p><strong>Nachricht:</strong></p>
        <div style="white-space: pre-wrap; padding: 12px; background: #f5f5f7; border-radius: 8px;">${escapeHtml(cleanMessage)}</div>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: cleanEmail,
        subject: `Neue Anfrage von ${cleanName}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const text = await resendRes.text();
      console.log(`contact: Resend send failed (${resendRes.status}): ${text}`);
      return c.json(
        { error: "E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen." },
        502,
      );
    }

    return c.json({ ok: true });
  } catch (err) {
    console.log(`contact: unexpected error: ${err instanceof Error ? err.stack ?? err.message : err}`);
    return c.json({ error: "Unerwarteter Fehler. Bitte später erneut versuchen." }, 500);
  }
});

Deno.serve(app.fetch);