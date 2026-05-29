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

    (async () => {
      try {
        // 4-second timeout prevents an indefinite hang on slow mobile networks,
        // which would leave a blank space in the SocialProof section.
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 4000);
        const res = await fetch(REVIEWS_URL, { signal: controller.signal });
        window.clearTimeout(timeoutId);
        debug("HTTP status:", res.status);

        const text = await res.text();
        let json: Record<string, unknown> | null = null;
        try {
          json = JSON.parse(text) as Record<string, unknown>;
        } catch {
          debug("Non-JSON response body:", text);
        }

        if (!res.ok || !json || json.error) {
          const message = json?.error ?? `HTTP ${res.status}`;
          debug("API error:", message);
          if (!cancelled) setError(typeof message === "string" ? message : JSON.stringify(message));
          return;
        }

        if (!Array.isArray(json.reviews)) {
          debug("Unexpected payload shape — reviews missing:", json);
          if (!cancelled) setError("Unerwartetes Antwortformat");
          return;
        }

        if (!cancelled) {
          debug(`Loaded ${json.reviews.length} reviews`);
          setData(json as GoogleReviewsData);
        }
      } catch (err) {
        debug("Network error:", err);
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading };
}
