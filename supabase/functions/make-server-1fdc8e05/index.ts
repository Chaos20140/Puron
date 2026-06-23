import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";

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

    const cached = await kv.get(REVIEWS_CACHE_KEY) as
      | { fetchedAt: number; payload: unknown }
      | null;

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
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
      // IMPORTANT: never cache error responses, and never leak the upstream
      // body to the client — it can contain API-key/quota diagnostics.
      return c.json({ error: "Reviews konnten nicht geladen werden." }, 502);
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

    // Only cache when we actually got reviews back from Google. This
    // guarantees error states (403, API_KEY_INVALID, REQUEST_DENIED, …)
    // never poison the cache.
    if (reviews.length > 0) {
      await kv.set(REVIEWS_CACHE_KEY, { fetchedAt: Date.now(), payload });
    }

    return c.json({ ...payload, cached: false });
  } catch (error) {
    console.log(`Unexpected error in /google-reviews: ${error instanceof Error ? error.stack ?? error.message : error}`);
    // IMPORTANT: never cache error responses, and never leak internals.
    return c.json({ error: "Reviews konnten nicht geladen werden." }, 500);
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
  // Standard HTML escape + named entities for German umlauts/ß so the
  // output renders correctly regardless of the email client's charset
  // handling.
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("ä", "&auml;")
    .replaceAll("ö", "&ouml;")
    .replaceAll("ü", "&uuml;")
    .replaceAll("Ä", "&Auml;")
    .replaceAll("Ö", "&Ouml;")
    .replaceAll("Ü", "&Uuml;")
    .replaceAll("ß", "&szlig;");
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

    const recipient = Deno.env.get("CONTACT_EMAIL_TO") || "Tolunay.u@outlook.de";

    // Mail-provider selection. If the Microsoft Graph app-only secrets are
    // present we send straight through the Microsoft 365 / Exchange mailbox
    // (no SMTP AUTH, no password stored — client-credentials OAuth + Graph
    // sendMail over HTTPS). Otherwise we fall back to Resend. This lets the
    // Graph code ship before the Azure app exists without changing behaviour.
    const msTenant = Deno.env.get("MS_TENANT_ID");
    const msClientId = Deno.env.get("MS_CLIENT_ID");
    const msClientSecret = Deno.env.get("MS_CLIENT_SECRET");
    const useGraph = Boolean(msTenant && msClientId && msClientSecret);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sender = Deno.env.get("CONTACT_EMAIL_FROM") || "onboarding@resend.dev";

    if (!useGraph && !resendApiKey) {
      console.log("contact: no mail provider configured (neither MS Graph nor RESEND_API_KEY)");
      return c.json(
        { error: "E-Mail-Versand ist gerade nicht konfiguriert. Bitte später erneut versuchen." },
        500,
      );
    }

    const cleanName = singleLine(name, 100);
    const cleanEmail = singleLine(email, 200);
    const cleanCompany = typeof company === "string" ? singleLine(company, 100) : "";
    const cleanGoal = typeof goal === "string" ? goal : "";
    const cleanMessage = message.trim().slice(0, 2000);
    const cleanPhone = ""; // Form doesn't collect phone yet — render em-dash below.

    // Local Berlin time, formatted in German.
    const submittedAt = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      dateStyle: "long",
      timeStyle: "short",
    });
    const fallback = (s: string) => (s.trim() ? escapeHtml(s) : "—");

    const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <!-- Force dark-only intent for clients that honor it (Apple Mail, iOS Mail,
         Outlook.com, Samsung Mail, Thunderbird). The Gmail mobile app ignores all
         of this and force-remaps colors with its own algorithm — Gmail is handled
         instead by the solid near-black surfaces + bgcolor attributes in the body
         below (a flat dark solid reads as "already dark" so Gmail leaves it). -->
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Neue Kontaktanfrage | Puron Media</title>
    <!--[if mso]>
    <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style type="text/css">
      :root { color-scheme: dark; supported-color-schemes: dark; }
      /* Clients that honor an authored dark scheme (Apple Mail, iOS Mail, Samsung
         Mail, Thunderbird, Outlook 2019+ Mac): re-pin the EXACT brand colors so
         the client can't invent its own after its remap pass. Needs the matching
         class hooks below to be present on the elements. */
      @media (prefers-color-scheme: dark) {
        .puron-body, body { background-color:#0A0814 !important; }
        .wrap   { background-color:#0A0814 !important; }
        .card   { background-color:#120C1E !important; }
        .hero   { background-color:#1E1530 !important; }
        .row    { background-color:#181030 !important; }
        .panel  { background-color:#150E26 !important; }
        .heading, h1, h2 { color:#fffffe !important; }
        .body-text, p, .msg { color:#F2ECFF !important; }
        .muted  { color:#CFC6E6 !important; }
        .accent, a.accent { color:#C39BFF !important; }
        .btn    { background-color:#7C3AED !important; }
        .btn-a  { color:#fffffe !important; }
      }
      /* Outlook.com + Yahoo inject data-ogsc (text) / data-ogsb (background)
         wrappers when they remap to dark — force the brand surfaces + white text
         back. (Gmail never injects these, so this hardens Outlook.com/Yahoo only.) */
      [data-ogsb] .puron-body, [data-ogsb] .wrap { background-color:#0A0814 !important; }
      [data-ogsb] .card  { background-color:#120C1E !important; }
      [data-ogsb] .hero  { background-color:#1E1530 !important; }
      [data-ogsb] .row   { background-color:#181030 !important; }
      [data-ogsb] .panel { background-color:#150E26 !important; }
      [data-ogsb] .btn   { background-color:#7C3AED !important; }
      [data-ogsc] .heading, [data-ogsc] h1, [data-ogsc] h2 { color:#fffffe !important; }
      [data-ogsc] .body-text, [data-ogsc] p, [data-ogsc] .msg { color:#F2ECFF !important; }
      [data-ogsc] .muted  { color:#CFC6E6 !important; }
      [data-ogsc] .accent { color:#C39BFF !important; }
      [data-ogsc] .btn-a  { color:#fffffe !important; }
    </style>
  </head>
  <body class="puron-body body" bgcolor="#0A0814" style="margin:0; padding:0; background-color:#0A0814; font-family:Arial, Helvetica, sans-serif; color:#fffffe;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; line-height:1px; font-size:1px;">
      Neue Kontaktanfrage &uuml;ber das Kontaktformular von Puron Media.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0A0814" class="wrap" style="background-color:#0A0814; margin:0; padding:0;">
      <tr>
        <td align="center" bgcolor="#0A0814" style="background-color:#0A0814; padding:32px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 18px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img src="https://puron-media.de/logo.png" width="56" height="56" alt="Puron Media" style="display:block; border:0; outline:none; text-decoration:none; margin-bottom:8px;">
                      <div class="heading" style="font-size:22px; line-height:28px; font-weight:900; letter-spacing:-0.5px; color:#fffffe;">
                        Puron <span style="color:#A855F7;">Media</span>
                      </div>
                      <div class="muted" style="font-size:13px; line-height:20px; color:#c3c8d6; margin-top:2px;">
                        Social Media Content, das Unternehmen sichtbar macht
                      </div>
                    </td>
                    <td align="right" style="vertical-align:top; font-size:12px; line-height:18px; color:#a8b0c4;">
                      Kontaktformular<br>
                      <span class="heading" style="color:#fffffe; font-weight:700;">Neue Anfrage</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#120C1E" class="card" style="background-color:#120C1E; border:1px solid #2A2040; border-radius:28px; overflow:hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td bgcolor="#1E1530" class="hero" style="padding:34px 30px 28px 30px; background-color:#1E1530;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#241640" style="padding:8px 12px; background-color:#241640; border:1px solid #4A2E7A; border-radius:999px; color:#D9CCFF; font-size:13px; line-height:18px; font-weight:800;">
                        Neue Kontaktanfrage eingegangen
                      </td></tr></table>
                      <h1 class="heading" style="margin:18px 0 10px 0; font-size:31px; line-height:38px; font-weight:900; letter-spacing:-0.9px; color:#fffffe;">
                        Eine Person hat das Kontaktformular auf Puron Media ausgef&uuml;llt.
                      </h1>
                      <p class="body-text" style="margin:0; font-size:15px; line-height:25px; color:#d7dbea;">
                        Unten findest du die wichtigsten Angaben aus dem Formular sowie die &uuml;bermittelte Nachricht.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:26px 30px 8px 30px;">
                      <h2 class="heading" style="margin:0 0 16px 0; font-size:20px; line-height:26px; font-weight:900; color:#fffffe;">Kontaktdaten</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate; border-spacing:0 10px;">
                        <tr>
                          <td width="36%" bgcolor="#181030" class="row muted" style="padding:14px 16px; background-color:#181030; border-radius:14px 0 0 14px; border:1px solid #2E2350; border-right:0; color:#CFC6E6; font-size:13px; line-height:20px; font-weight:700;">Name</td>
                          <td bgcolor="#181030" class="row body-text" style="padding:14px 16px; background-color:#181030; border-radius:0 14px 14px 0; border:1px solid #2E2350; border-left:0; color:#fffffe; font-size:15px; line-height:22px; font-weight:800;">${fallback(cleanName)}</td>
                        </tr>
                        <tr>
                          <td width="36%" bgcolor="#181030" class="row muted" style="padding:14px 16px; background-color:#181030; border-radius:14px 0 0 14px; border:1px solid #2E2350; border-right:0; color:#CFC6E6; font-size:13px; line-height:20px; font-weight:700;">E-Mail</td>
                          <td bgcolor="#181030" class="row body-text" style="padding:14px 16px; background-color:#181030; border-radius:0 14px 14px 0; border:1px solid #2E2350; border-left:0; color:#fffffe; font-size:15px; line-height:22px; font-weight:800;"><a href="mailto:${escapeHtml(cleanEmail)}" class="accent" style="color:#C39BFF; text-decoration:none; font-weight:700;">${escapeHtml(cleanEmail)}</a></td>
                        </tr>
                        <tr>
                          <td width="36%" bgcolor="#181030" class="row muted" style="padding:14px 16px; background-color:#181030; border-radius:14px 0 0 14px; border:1px solid #2E2350; border-right:0; color:#CFC6E6; font-size:13px; line-height:20px; font-weight:700;">Telefon</td>
                          <td bgcolor="#181030" class="row body-text" style="padding:14px 16px; background-color:#181030; border-radius:0 14px 14px 0; border:1px solid #2E2350; border-left:0; color:#fffffe; font-size:15px; line-height:22px; font-weight:800;">${fallback(cleanPhone)}</td>
                        </tr>
                        <tr>
                          <td width="36%" bgcolor="#181030" class="row muted" style="padding:14px 16px; background-color:#181030; border-radius:14px 0 0 14px; border:1px solid #2E2350; border-right:0; color:#CFC6E6; font-size:13px; line-height:20px; font-weight:700;">Unternehmen</td>
                          <td bgcolor="#181030" class="row body-text" style="padding:14px 16px; background-color:#181030; border-radius:0 14px 14px 0; border:1px solid #2E2350; border-left:0; color:#fffffe; font-size:15px; line-height:22px; font-weight:800;">${fallback(cleanCompany)}</td>
                        </tr>
                        <tr>
                          <td width="36%" bgcolor="#181030" class="row muted" style="padding:14px 16px; background-color:#181030; border-radius:14px 0 0 14px; border:1px solid #2E2350; border-right:0; color:#CFC6E6; font-size:13px; line-height:20px; font-weight:700;">Interesse</td>
                          <td bgcolor="#181030" class="row body-text" style="padding:14px 16px; background-color:#181030; border-radius:0 14px 14px 0; border:1px solid #2E2350; border-left:0; color:#fffffe; font-size:15px; line-height:22px; font-weight:800;">${fallback(cleanGoal)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 30px 28px 30px;">
                      <h2 class="heading" style="margin:0 0 14px 0; font-size:20px; line-height:26px; font-weight:900; color:#fffffe;">Nachricht</h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#181030" class="row" style="background-color:#181030; border-radius:20px; border:1px solid #2E2350;">
                        <tr>
                          <td class="msg body-text" style="padding:22px; color:#F2ECFF; font-size:15px; line-height:26px; white-space:pre-line;">${escapeHtml(cleanMessage)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 30px 30px 30px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#150E26" class="panel" style="background-color:#150E26; border:1px solid #2A2040; border-radius:20px;">
                        <tr>
                          <td style="padding:20px 20px 8px 20px;">
                            <h2 class="heading" style="margin:0 0 12px 0; font-size:18px; line-height:24px; font-weight:900; color:#fffffe;">Formular-Details</h2>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 20px 20px 20px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td width="40%" class="muted" style="padding:7px 0; font-size:13px; line-height:20px; color:#858ea4; font-weight:700;">Quelle</td>
                                <td class="body-text" style="padding:7px 0; font-size:13px; line-height:20px; color:#d7dbea;">Kontaktformular Puron Media</td>
                              </tr>
                              <tr>
                                <td width="40%" class="muted" style="padding:7px 0; font-size:13px; line-height:20px; color:#858ea4; font-weight:700;">Website</td>
                                <td class="body-text" style="padding:7px 0; font-size:13px; line-height:20px; color:#d7dbea;"><a href="https://puron-media.de/" target="_blank" class="accent" style="color:#C39BFF; text-decoration:none; font-weight:700;">puron-media.de</a></td>
                              </tr>
                              <tr>
                                <td width="40%" class="muted" style="padding:7px 0; font-size:13px; line-height:20px; color:#858ea4; font-weight:700;">Zeitpunkt</td>
                                <td class="body-text" style="padding:7px 0; font-size:13px; line-height:20px; color:#d7dbea;">${escapeHtml(submittedAt)}</td>
                              </tr>
                              <tr>
                                <td width="40%" class="muted" style="padding:7px 0; font-size:13px; line-height:20px; color:#858ea4; font-weight:700;">Antwort an</td>
                                <td class="body-text" style="padding:7px 0; font-size:13px; line-height:20px; color:#d7dbea;"><a href="mailto:${escapeHtml(cleanEmail)}" class="accent" style="color:#C39BFF; text-decoration:none; font-weight:700;">${escapeHtml(cleanEmail)}</a></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 30px 34px 30px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td align="center" bgcolor="#7C3AED" class="btn" style="background-color:#7C3AED; border-radius:16px;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="mailto:${escapeHtml(cleanEmail)}" style="height:52px;v-text-anchor:middle;width:300px;" arcsize="31%" fillcolor="#7C3AED" stroke="f">
                              <w:anchorlock/>
                              <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:900;">Direkt auf Anfrage antworten</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a href="mailto:${escapeHtml(cleanEmail)}?subject=Antwort auf deine Anfrage bei Puron Media" class="btn-a" style="display:block; padding:16px 22px; font-size:15px; line-height:20px; font-weight:900; color:#fffffe; text-decoration:none; border-radius:16px; background-color:#7C3AED;">Direkt auf Anfrage antworten</a>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 18px 0 18px; font-size:12px; line-height:20px; color:#737b8f;">
                <div class="heading" style="font-size:13px; line-height:21px; font-weight:800; color:#fffffe; margin-bottom:4px;">Puron Media</div>
                <div>Automatisch generierte E-Mail aus dem Kontaktformular.</div>
                <div style="margin-top:10px; color:#9098ad;">Diese Nachricht wurde &uuml;ber die Website &uuml;bermittelt. Bitte pr&uuml;fe die Angaben vor einer Antwort.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    if (useGraph) {
      // Microsoft Graph (app-only): mint a client-credentials token, then
      // sendMail AS the mailbox. saveToSentItems:false keeps the inquiry out of
      // the Sent folder; reply_to is the submitter so a reply reaches them.
      const msSender = Deno.env.get("MS_SENDER") || recipient;
      let accessToken = "";
      try {
        const tokenRes = await fetch(
          `https://login.microsoftonline.com/${msTenant}/oauth2/v2.0/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: msClientId as string,
              client_secret: msClientSecret as string,
              scope: "https://graph.microsoft.com/.default",
              grant_type: "client_credentials",
            }),
          },
        );
        if (!tokenRes.ok) {
          console.log(`contact: MS token failed (${tokenRes.status}): ${await tokenRes.text()}`);
          return c.json(
            { error: "E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen." },
            502,
          );
        }
        accessToken = (await tokenRes.json()).access_token;
      } catch (e) {
        console.log(`contact: MS token error: ${e}`);
        return c.json(
          { error: "E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen." },
          502,
        );
      }

      const graphRes = await fetch(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(msSender)}/sendMail`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              subject: `Neue Anfrage von ${cleanName}`,
              body: { contentType: "HTML", content: html },
              toRecipients: [{ emailAddress: { address: recipient } }],
              replyTo: [{ emailAddress: { address: cleanEmail } }],
            },
            saveToSentItems: false,
          }),
        },
      );

      if (!graphRes.ok) {
        console.log(`contact: MS Graph sendMail failed (${graphRes.status}): ${await graphRes.text()}`);
        return c.json(
          { error: "E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen." },
          502,
        );
      }

      return c.json({ ok: true });
    }

    // Resend fallback (used until the Microsoft Graph secrets are configured).
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