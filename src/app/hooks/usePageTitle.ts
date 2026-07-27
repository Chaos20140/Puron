import { useEffect } from "react";
import { fullTitle } from "../seo";

function setMeta(selector: string, attr: "content", value: string): string | null {
  const el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) return null;
  const previous = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return previous;
}

/**
 * Sets `document.title` for the duration the calling component is mounted,
 * and restores the previous title on unmount. Suffix is appended automatically
 * unless the caller passes a title that already contains "Puron".
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = fullTitle(title);
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/**
 * usePageTitle plus the tags that actually differ per page: meta description,
 * canonical, og:title/og:description/og:url and the Twitter equivalents.
 *
 * The build already stamps these into each static dist/<route>/index.html (see
 * spa-static-routes in vite.config.ts) — this keeps them correct after a
 * CLIENT-SIDE navigation, which is what social scrapers and "share this page"
 * browser features read. Everything is restored on unmount, so leaving a page
 * never leaves its metadata behind.
 */
export function usePageMeta(title: string, description: string, path?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const resolved = fullTitle(title);
    const url = path ? new URL(path, window.location.origin).href : window.location.href;

    document.title = resolved;
    const restore: Array<[string, string | null]> = [
      ['meta[name="description"]', setMeta('meta[name="description"]', "content", description)],
      ['meta[property="og:title"]', setMeta('meta[property="og:title"]', "content", resolved)],
      ['meta[property="og:description"]', setMeta('meta[property="og:description"]', "content", description)],
      ['meta[property="og:url"]', setMeta('meta[property="og:url"]', "content", url)],
      ['meta[name="twitter:title"]', setMeta('meta[name="twitter:title"]', "content", resolved)],
      ['meta[name="twitter:description"]', setMeta('meta[name="twitter:description"]', "content", description)],
    ];

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute("href") ?? null;
    if (canonical) canonical.setAttribute("href", url);

    return () => {
      document.title = previousTitle;
      for (const [selector, value] of restore) {
        if (value === null) continue;
        document.head.querySelector(selector)?.setAttribute("content", value);
      }
      if (canonical && previousCanonical !== null) canonical.setAttribute("href", previousCanonical);
    };
  }, [title, description, path]);
}
