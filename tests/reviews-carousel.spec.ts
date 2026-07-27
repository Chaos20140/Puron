import { expect, test } from "@playwright/test";

const REVIEWS_ENDPOINT = "**/functions/v1/make-server-1fdc8e05/google-reviews";

// Shaped like the REAL payload the edge function returns, including the
// `authorPhoto` lh3.googleusercontent.com URL — the live API always sends one.
// The card must ignore it (see the DSGVO test below), so a mock with
// `authorPhoto: null` would have silently passed either way.
const mockReviews = {
  name: "Puron Media",
  rating: 5,
  userRatingCount: 12,
  googleMapsUri: "https://maps.google.com/?cid=123",
  reviews: Array.from({ length: 6 }).map((_, i) => ({
    author: `Testkunde ${i + 1}`,
    authorPhoto: `https://lh3.googleusercontent.com/a/FAKE${i}=s128-c0x00000000-cc-rp-mo`,
    authorUri: `https://www.google.com/maps/contrib/1000000000000000000${i}/reviews`,
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

    // Der Marquee pausiert bewusst, solange die Sektion NICHT im Viewport ist
    // (IntersectionObserver → data-active). toBeVisible() prüft nur eine
    // nicht-leere Box, nicht die Sichtbarkeit im Viewport — ohne Scroll maß der
    // Test deshalb zweimal denselben eingefrorenen Offset und schlug sporadisch
    // fehl. Erst in den Viewport scrollen und auf data-active warten.
    await track.scrollIntoViewIfNeeded();
    await expect(page.locator('.review-carousel-wrap[data-active="true"]')).toHaveCount(1);

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

  test("Bewertung + Anzahl werden angezeigt und verlinken zu Google", async ({ page }) => {
    await page.goto("/");
    // Präzise: die Aggregat-Zeile unter der Überschrift. `/auf Google ansehen/`
    // allein träfe auch jede Karte (deren aria-label endet genauso).
    const link = page.getByRole("link", { name: /^5\.0 \(12 Bewertungen/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://maps.google.com/?cid=123");

    // Genau EINE Karte pro Rezension im A11y-Baum — der geklonte zweite Satz
    // des Marquees ist aria-hidden und darf nicht doppelt auftauchen.
    await expect(page.getByRole("link", { name: /^Google-Rezension von/ })).toHaveCount(6);
  });

  test("keine Anfrage an googleusercontent.com (DSGVO)", async ({ page }) => {
    const googleRequests: string[] = [];
    page.on("request", (r) => {
      if (/googleusercontent\.com|fonts\.g(oogleapis|static)\.com/.test(r.url())) googleRequests.push(r.url());
    });

    await page.goto("/");
    await expect(page.getByText("Testkunde 1").first()).toBeVisible();
    // Die Karte muss den Initialen-Platzhalter zeigen, nicht das Google-Foto.
    await expect(page.locator(".review-marquee-track img")).toHaveCount(0);
    expect(googleRequests, `Direktanfragen an Google: ${googleRequests.join(", ")}`).toHaveLength(0);
  });

  test("Marquee ist breiter als sein Fenster (kein Leerstreifen beim Umschlag)", async ({ page }) => {
    await page.goto("/");
    const wrap = page.locator(".review-carousel-wrap");
    await expect(wrap).toBeVisible();

    const { fenster, haelfte } = await page.evaluate(() => {
      const w = document.querySelector(".review-carousel-wrap") as HTMLElement;
      const t = document.querySelector(".review-marquee-track") as HTMLElement;
      return { fenster: w.clientWidth, haelfte: t.scrollWidth / 2 };
    });
    // translateX(-50%) scrollt genau eine Hälfte. Ist sie schmaler als das
    // Fenster, läuft das Fenster am Zyklusende über das Track-Ende hinaus.
    expect(haelfte).toBeGreaterThanOrEqual(fenster);
  });
});

test.describe("Partner-Ticker", () => {
  test("Ticker ist breiter als sein Fenster", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".partner-ticker-wrap")).toBeVisible();
    const { fenster, haelfte } = await page.evaluate(() => {
      const w = document.querySelector(".partner-ticker-wrap") as HTMLElement;
      const t = document.querySelector(".partner-marquee-track") as HTMLElement;
      return { fenster: w.clientWidth, haelfte: t.scrollWidth / 2 };
    });
    expect(haelfte).toBeGreaterThanOrEqual(fenster);
  });
});
