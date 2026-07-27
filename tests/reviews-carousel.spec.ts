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

  test("Bewertung + Anzahl werden angezeigt und verlinken zu Google", async ({ page }) => {
    await page.goto("/");
    // Präzise: die Aggregat-Zeile unter der Überschrift. `/auf Google ansehen/`
    // allein träfe auch jede Karte (deren aria-label endet genauso).
    const link = page.getByRole("link", { name: /^5\.0 \(12 Bewertungen/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://maps.google.com/?cid=123");

    // Genau EINE Karte pro Rezension im A11y-Baum — die Kopien der Schiene
    // sind aria-hidden und duerfen nicht mehrfach auftauchen.
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
    await expect(page.locator(".review-rail img")).toHaveCount(0);
    expect(googleRequests, `Direktanfragen an Google: ${googleRequests.join(", ")}`).toHaveLength(0);
  });

  test("eine Kopie ist mindestens so breit wie die Schiene (nahtloser Sprung)", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator(".review-rail");
    await expect(rail).toBeVisible();

    const { schiene, kopie } = await page.evaluate(() => {
      const r = document.querySelector(".review-rail") as HTMLElement;
      const t = r.firstElementChild as HTMLElement;
      return { schiene: r.clientWidth, kopie: t.scrollWidth / 3 };
    });
    // Der Endlos-Sprung versetzt um genau eine Kopie. Ist die schmaler als die
    // Schiene, waere der Sprung sichtbar.
    expect(kopie).toBeGreaterThanOrEqual(schiene);
  });

  test("ist eine echte Scroll-Schiene mit Snap und blockiert kein Seiten-Scrollen", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator(".review-rail");
    await expect(rail).toBeVisible();

    const styles = await rail.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        overflowX: cs.overflowX,
        snap: cs.scrollSnapType,
        touchAction: cs.touchAction,
        overscrollX: cs.overscrollBehaviorX,
        scrollbarBreite: (el as HTMLElement).offsetHeight - (el as HTMLElement).clientHeight,
      };
    });
    expect(styles.overflowX).toBe("auto");
    expect(styles.snap).toContain("mandatory");
    // touch-action: pan-x wuerde das vertikale Seiten-Scrollen ueber dem
    // Karussell blockieren — das war schon einmal ein Fehler.
    expect(styles.touchAction).not.toBe("pan-x");
    // Ohne contain wischt man auf iOS/Android in die Zurueck-Geste.
    expect(styles.overscrollX).toBe("contain");
    expect(styles.scrollbarBreite).toBe(0);
  });

  test("manuelles Durchblaettern bewegt die Schiene, danach laeuft Autoplay weiter", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator(".review-rail");
    await expect(rail).toBeVisible();
    await rail.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900); // Schiene setzt sich auf ihre Home-Position

    const pos = () => rail.evaluate((el) => Math.round(el.scrollLeft));
    const vorher = await pos();

    // Horizontales Wischen/Blaettern nachstellen (Touch-Drag hat Playwright
    // nicht als Primitive; ein horizontales Rad geht durch denselben Pfad:
    // Nutzer bewegt die Schiene selbst und pausiert damit das Autoplay).
    const box = (await rail.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(300, 0);
    await page.waitForTimeout(700);

    const nachWischen = await pos();
    expect(nachWischen, "manuelles Blaettern hat die Schiene nicht bewegt").not.toBe(vorher);

    // Und danach darf sie NICHT stehen bleiben.
    await page.mouse.move(box.x + box.width / 2, box.y - 200); // Zeiger weg (Hover-Pause loesen)
    await page.waitForTimeout(2600 + 4200);
    expect(await pos(), "Karussell blieb nach dem Blaettern stehen").not.toBe(nachWischen);
  });

  test("Seiten-Scrollen haelt das Karussell NICHT an", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator(".review-rail");
    await expect(rail).toBeVisible();
    await rail.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    const vorher = await rail.evaluate((el) => Math.round(el.scrollLeft));
    // Waehrend der ganzen Wartezeit die Seite vertikal bewegen — frueher fror
    // das Karussell dabei ein (data-scrolling-Hack).
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, i % 2 === 0 ? 25 : -25);
      await page.waitForTimeout(500);
    }
    const nachher = await rail.evaluate((el) => Math.round(el.scrollLeft));
    expect(nachher, "Karussell stand waehrend des Seiten-Scrollens still").not.toBe(vorher);
  });

  test("Pfeiltasten blaettern (Desktop/Tastatur)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const rail = page.locator(".review-rail");
    await expect(rail).toBeVisible();
    await rail.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    const vorher = await rail.evaluate((el) => Math.round(el.scrollLeft));
    await page.getByRole("button", { name: "Nächste Rezension" }).click();
    await page.waitForTimeout(700);
    expect(await rail.evaluate((el) => Math.round(el.scrollLeft))).toBeGreaterThan(vorher);
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
