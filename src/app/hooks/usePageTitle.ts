import { useEffect } from "react";

const SITE_SUFFIX = " — Puron Agency";

/**
 * Sets `document.title` for the duration the calling component is mounted,
 * and restores the previous title on unmount. Suffix is appended automatically
 * unless the caller passes a title that already contains "Puron".
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title.includes("Puron") ? title : `${title}${SITE_SUFFIX}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
