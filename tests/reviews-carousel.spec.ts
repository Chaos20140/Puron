import { expect, test } from "@playwright/test";

const REVIEWS_ENDPOINT = "**/functions/v1/make-server-1fdc8e05/google-reviews";

const mockReviews = {
  name: "Puron Media",
  rating: 5,
  userRatingCount: 12,
  googleMapsUri: "https://maps.google.com/?cid=123",
  reviews: Array.from({ length: 6 }).map((_, i) => ({
    author: `Testkunde ${i + 1}`,
    authorPhoto: null,
    authorUri: null,
    rating: 5,
    text: `Sehr zufrieden mit Puron Media — Bewertung Nummer ${i + 1}. Klare Kommunikation, messbare Ergebnisse.`,
    relativeTime: "vor einem Monat",
    publishTime: null,
  })),
  fetchedAt: Date.now(),
};

// Mobile viewport; the reported bugs were all phone-only.
test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });

test.describe("Google-Rezensionen Karussell (Mobile)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(REVIEWS_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockReviews),
      });
    });
  });

  test("rendert Karten ohne touch-action: pan-x und ohne Mandatory-Snap", async ({ page }) => {
    await page.goto("/");
    const wrap = page.locator(".review-carousel-wrap");
    await expect(wrap).toBeVisible();
    await expect(page.getByText("Testkunde 1").first()).toBeVisible();

    const styles = await wrap.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { touchAction: cs.touchAction, snap: cs.scrollSnapType };
    });
    // pan-x blockierte das vertikale Seiten-Scrollen über dem Karussell.
    expect(styles.touchAction).not.toBe("pan-x");
    // Kein Mandatory-Snap, der mit der Animation kämpfen könnte.
    expect(styles.snap).not.toContain("mandatory");
  });

  test("GPU-Marquee läuft und bewegt die Karten nach links (rechts→links)", async ({ page }) => {
    await page.goto("/");
    const track = page.locator(".review-marquee-track");
    await expect(track).toBeVisible();

    // Es ist eine echte CSS-Animation (Compositor) — kein scrollLeft-Hack.
    const animName = await track.evaluate((el) => getComputedStyle(el).animationName);
    expect(animName).toBe("review-marquee");

    const translateX = () =>
      track.evaluate((el) => {
        const t = getComputedStyle(el).transform;
        if (!t || t === "none") return 0;
        return new DOMMatrixReadOnly(t).m41;
      });

    const before = await translateX();
    await page.waitForTimeout(600);
    const after = await translateX();
    // translateX wird negativer → Inhalt wandert nach links.
    expect(after).toBeLessThan(before);
  });

  test("Touch pausiert die Animation", async ({ page }) => {
    await page.goto("/");
    const wrap = page.locator(".review-carousel-wrap");
    await expect(wrap).toBeVisible();

    await wrap.dispatchEvent("touchstart");
    await expect(wrap).toHaveAttribute("data-paused", "true");

    const playState = await page
      .locator(".review-marquee-track")
      .evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(playState).toBe("paused");
  });
});
