import { useEffect, useState } from "react";

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

// Hardcoded to the Supabase project that hosts the working edge function.
// No `?force=1` here — we WANT to hit the 1-hour KV cache on every page load.
// Pass `?force=1` manually only when debugging stale data.
const REVIEWS_URL =
  "https://fhgevybapodhubkuylnw.supabase.co/functions/v1/make-server-1fdc8e05/google-reviews";

export function useGoogleReviews() {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log("[GoogleReviews] Fetching:", REVIEWS_URL);
        const res = await fetch(REVIEWS_URL);
        console.log("[GoogleReviews] HTTP status:", res.status);

        const text = await res.text();
        let json: any = null;
        try {
          json = JSON.parse(text);
        } catch {
          console.error("[GoogleReviews] Non-JSON response body:", text);
        }
        console.log("[GoogleReviews] Response body:", json ?? text);

        if (!res.ok || !json || json.error) {
          const message = json?.error ?? `HTTP ${res.status}`;
          console.warn("[GoogleReviews] API error:", message, json?.details ?? "");
          if (!cancelled) setError(typeof message === "string" ? message : JSON.stringify(message));
          return;
        }

        if (!Array.isArray(json.reviews)) {
          console.warn("[GoogleReviews] Unexpected payload shape — reviews missing:", json);
          if (!cancelled) setError("Unerwartetes Antwortformat");
          return;
        }

        if (!cancelled) {
          console.log(`[GoogleReviews] Loaded ${json.reviews.length} reviews`);
          setData(json as GoogleReviewsData);
        }
      } catch (err) {
        console.error("[GoogleReviews] Network error:", err);
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
