import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// CORS is intentionally wide-open: this edge function exposes a single public,
// read-only GET endpoint that returns Google Places review data with no PII
// and no auth. If you ever add an authenticated/mutating route, lock `origin`
// down to the marketing site's domain(s) before deploying.
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "OPTIONS"],
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

Deno.serve(app.fetch);