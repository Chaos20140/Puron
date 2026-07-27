// Google reviews as static content.
//
// These used to be fetched live from the Google Places API through a Supabase
// edge function. That was dropped on 2026-07-28: the Places API (New) is billed
// per call, and when Google started rejecting the requests the whole reviews
// section disappeared from the site. For five testimonials that change a few
// times a year, a paid API with a quota, a cache, a fallback path and an outage
// mode is a lot of moving parts to buy nothing.
//
// The texts below are the real reviews, copied verbatim from the last API
// response. They are TEXT on purpose — screenshots would be invisible to Google
// and to screen readers, wouldn't reflow on a narrow phone, and would weigh far
// more than the few hundred bytes this costs.
//
// TO ADD A NEW REVIEW: open the Google profile (GOOGLE_REVIEWS_URL below), copy
// the author, star count, text and date into a new entry at the TOP of the
// array, and bump AGGREGATE. Nothing else to do — no build step, no deploy key.

export type Review = {
  author: string;
  /** 1–5, as given on Google. */
  rating: number;
  text: string;
  /** ISO date of the review. The "vor X Monaten" label is derived from this at
   *  render time, so it never goes stale the way a frozen string would. */
  publishedAt: string;
};

/** The business's Google profile — the "auf Google ansehen" target. */
export const GOOGLE_REVIEWS_URL =
  "https://maps.google.com/?cid=5737899973413285232";

/** Overall score shown above the carousel. Keep in sync with Google. */
export const AGGREGATE = {
  rating: 5,
  count: 27,
  /** When these numbers were last checked against the Google profile. */
  checkedOn: "2026-07-28",
};

export const REVIEWS: Review[] = [
  {
    author: "Dilara Kostkowski",
    rating: 5,
    text: "Super freundliches Team und richtig starke Arbeit! Kommunikation lief unkompliziert und das Endergebnis war einfach top!!! Würde jederzeit wieder zusammenarbeiten!❤️",
    publishedAt: "2026-05-07",
  },
  {
    author: "Gökdeniz Özer",
    rating: 5,
    text: "Ich habe mich hier bestens aufgehoben gefühlt. Der Service ist nicht nur professionell, sondern auch menschlich top. Eine klare Empfehlung meinerseits!",
    publishedAt: "2026-05-07",
  },
  {
    author: "Nawien Osman",
    rating: 5,
    text: "Durchgehend positiv! Sehr professionell, freundlich und zuverlässig. In allen Bereichen super unterstützt und immer schnell geholfen. Absolut empfehlenswert!",
    publishedAt: "2026-05-07",
  },
  {
    author: "Alisa Ilkbahar",
    rating: 5,
    text: "Man merkt sofort, dass hier kundenorientiert gearbeitet wird. Sehr zuverlässig, freundlich und qualitativ top, ganz klare Empfehlung.",
    publishedAt: "2026-05-07",
  },
  {
    author: "Birant Karacalar",
    rating: 5,
    text: "Sehr professionell, zuverlässig und kompetent. Die Zusammenarbeit lief reibungslos und die Ergebnisse haben meine Erwartungen übertroffen. Klare Empfehlung!",
    publishedAt: "2026-04-20",
  },
];

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * "vor 2 Monaten" — computed from the review date instead of being stored, so a
 * review written today still reads correctly in a year's time.
 */
export function relativeTime(publishedAt: string, now: Date = new Date()): string {
  const then = new Date(publishedAt);
  if (Number.isNaN(then.getTime())) return "";
  const elapsed = now.getTime() - then.getTime();
  if (elapsed < 0) return "gerade eben";

  const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
  if (days < 1) return "heute";
  if (days === 1) return "gestern";
  if (days < 30) return `vor ${days} Tagen`;

  const months = Math.floor(elapsed / MONTH_MS);
  if (months < 12) return months === 1 ? "vor einem Monat" : `vor ${months} Monaten`;

  const years = Math.floor(months / 12);
  return years === 1 ? "vor einem Jahr" : `vor ${years} Jahren`;
}
