import { useEffect, useState } from "react";
import { SUPABASE_FUNCTION_URL } from "../api";

export type GoogleReview = {
  author: string;
  authorPhoto: string | null;
  authorUri: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string | null;
};

export type GoogleReviewsData = {
  name: string;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
  reviews: GoogleReview[];
  fetchedAt: number;
};

const REVIEWS_URL = `${SUPABASE_FUNCTION_URL}/google-reviews`;

// Diagnostics are noisy and would expose the internal endpoint + payloads in
// every visitor's console. Keep them in dev only.
const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log("[GoogleReviews]", ...args);
};

export function useGoogleReviews() {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Controller and timer live in the EFFECT scope, not inside the async IIFE,
    // so the cleanup can actually reach them. Previously cleanup only flipped
    // `cancelled`: the in-flight request ran to completion after the user had
    // navigated away, and the 4s timer still fired an abort() into the void.
    const controller = new AbortController();
    // 4-second timeout prevents an indefinite hang on slow mobile networks,
    // which would leave a blank space in the SocialProof section.
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    (async () => {
      try {
        const res = await fetch(REVIEWS_URL, { signal: controller.signal });
        debug("HTTP status:", res.status);

        const text = await res.text();
        let json: Record<string, unknown> | null = null;
        try {
          json = JSON.parse(text) as Record<string, unknown>;
        } catch {
          debug("Non-JSON response body:", text);
        }

        if (!res.ok || !json || json.error) {
          // The raw upstream message stays in the dev-only console. Putting it
          // in React state risks it being rendered verbatim the day someone
          // writes `{reviewsError}` into the JSX — the consumer only ever needs
          // to know THAT it failed, never why.
          debug("API error:", json?.error ?? `HTTP ${res.status}`);
          if (!cancelled) setError("unavailable");
          return;
        }

        if (!Array.isArray(json.reviews)) {
          debug("Unexpected payload shape — reviews missing:", json);
          if (!cancelled) setError("unavailable");
          return;
        }

        if (!cancelled) {
          debug(`Loaded ${json.reviews.length} reviews`);
          setData(json as GoogleReviewsData);
        }
      } catch (err) {
        // Same rule as above: details to the dev console, an opaque marker to
        // the UI. `String(err)` on a network failure can carry the full request
        // URL and the browser's internal error text.
        debug("Network error:", err);
        if (!cancelled) setError("unavailable");
      } finally {
        // clearTimeout used to sit only on the success path, so a network error
        // left the timer running until it expired.
        window.clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return { data, error, loading };
}
