// Single source of truth for per-page SEO metadata.
//
// It is consumed TWICE:
//  1. at build time by the `spa-static-routes` plugin in vite.config.ts, which
//     stamps title/description/canonical/OG into the static dist/<route>/
//     index.html that GitHub Pages serves to crawlers, and
//  2. at runtime by usePageMeta(), so client-side navigation updates the same
//     tags for anything that reads the live DOM.
//
// Before this existed the per-route HTML files were verbatim copies of the home
// page with only canonical + og:url swapped — so /services/, /team/, /contact/,
// /imprint/ and /privacy/ all reported the HOME page's title and description to
// Google. Duplicate titles/descriptions across a small site dilute every one of
// them. Keep this file free of browser globals: vite.config.ts imports it in
// Node.
export const SITE_ORIGIN = "https://puron-media.de";
export const SITE_NAME = "Puron Media";

export type PageMeta = {
  title: string;
  description: string;
};

// The title carries the local search terms the business actually competes for
// ("Social Media Agentur" + Meschede/Sauerland) instead of only the tagline —
// the JSON-LD in index.html already positions this as a local ProfessionalService.
export const HOME_META: PageMeta = {
  title: "Social Media Agentur Meschede & Sauerland — Puron Media",
  description:
    "Puron Media aus Meschede produziert Reels, Posts, Ads und Content-Strategien, die Unternehmen Kunden, Bewerber und langfristige Aufmerksamkeit gewinnen lassen.",
};

// Keys are the route segments; they must match ROUTES in vite.config.ts.
export const ROUTE_META: Record<string, PageMeta> = {
  services: {
    title: "Dienstleistungen: Reels, Beiträge, Ads & Strategie",
    description:
      "Reels, Social-Media-Beiträge, Werbeanzeigen für Meta, Google und LinkedIn sowie komplette Content-Strategien — was Puron Media aus Meschede für Unternehmen umsetzt.",
  },
  team: {
    title: "Unser Team — die Köpfe hinter Puron Media",
    description:
      "Lern das Team von Puron Media aus Meschede kennen: Gründer Mahsuni Akdemir und der kreative Kopf hinter den Inhalten unserer Kunden.",
  },
  contact: {
    title: "Kontakt aufnehmen",
    description:
      "Kontakt zu Puron Media in Meschede: Schreib uns über das Formular oder erreich uns direkt per WhatsApp, E-Mail an info@puron-media.de oder Telefon.",
  },
  imprint: {
    title: "Impressum",
    description:
      "Anbieterkennzeichnung von Puron Media, Meschede, nach § 5 DDG und § 18 Abs. 2 MStV.",
  },
  privacy: {
    title: "Datenschutzerklärung",
    description:
      "Wie Puron Media personenbezogene Daten verarbeitet: Kontaktformular, eingesetzte Dienstleister, deine Rechte nach DSGVO.",
  },
};

const SUFFIX = ` — ${SITE_NAME}`;

/** Titles are stored short; the brand suffix is appended unless already present. */
export function fullTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title}${SUFFIX}`;
}
