import { expect, test, type Page } from "@playwright/test";

// Regression cover for a user-reported bug: on a phone the full-screen backdrop
// blinked out "every now and then, but only while scrolling".
//
// Cause: scrolling on mobile collapses/expands the address bar, which fires
// `resize` and shrinks `window.innerHeight` — while the canvas itself is
// `fixed … h-screen` (100vh), which on mobile resolves to the LARGE viewport
// height and does NOT move with the bar. Sizing the backing store from
// window.innerHeight therefore re-allocated it on nearly every scroll, and
// assigning canvas.width/height WIPES the backing store. With `{ alpha: false }`
// the wiped canvas is opaque black until something repaints it — up to a full
// frame later, since mobile caps repaints to 30fps.
//
// A headless viewport has no address bar, so `window.innerHeight` never
// diverges from the CSS box on its own. These tests create that divergence
// explicitly: that is the whole point, and it is what makes them fail against
// the old implementation instead of passing regardless.

const stubShorterInnerHeight = (page: Page, by: number) =>
  page.evaluate((delta) => {
    const real = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      value: real - delta,
      configurable: true,
    });
    window.dispatchEvent(new Event("resize"));
  }, by);

/** Two frames: enough for a requestAnimationFrame-debounced handler to run. */
const twoFrames = (page: Page) =>
  page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );

const settle = async (page: Page) => {
  await page.goto("/");
  await expect(page.locator("canvas").first()).toBeVisible();
  await page.waitForTimeout(1000); // let the first frames paint
};

const measure = (page: Page) =>
  page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement;
    const ctx = c.getContext("2d")!;
    let sum = 0;
    const n = 150;
    for (let i = 0; i < n; i++) {
      const d = ctx.getImageData(Math.floor((i * 37) % c.width), Math.floor((i * 53) % c.height), 1, 1).data;
      sum += d[0] + d[1] + d[2];
    }
    return { brightness: sum / n, backingH: c.height, cssH: c.clientHeight, backingW: c.width, cssW: c.clientWidth };
  });

test.describe("Hintergrund-Canvas", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Adressleiste (innerHeight schrumpft) verändert den Backing-Store NICHT", async ({ page }) => {
    await settle(page);
    const vorher = await measure(page);
    expect(vorher.backingH).toBe(vorher.cssH);

    await stubShorterInnerHeight(page, 120); // typische Adressleisten-Höhe
    await twoFrames(page);

    const nachher = await measure(page);
    // Der alte Code hätte hier canvas.height = 724 gesetzt: Backing-Store neu
    // alloziert (= geleert) UND 120px kürzer als die CSS-Box, also ein
    // schwarzer Streifen am unteren Rand.
    expect(nachher.backingH, "Backing-Store folgte window.innerHeight statt der CSS-Box").toBe(nachher.cssH);
    expect(nachher.backingH).toBe(vorher.backingH);
    expect(nachher.brightness, "Canvas wurde durch den Adressleisten-Resize geleert").toBeGreaterThan(1);
  });

  test("mehrere Scroll-Resizes hintereinander lassen den Canvas unberührt", async ({ page }) => {
    await settle(page);
    const vorher = await measure(page);

    // Ein Scrollgestus feuert die Adressleisten-Animation dutzendfach.
    for (let i = 0; i < 10; i++) {
      await stubShorterInnerHeight(page, i % 2 === 0 ? 120 : 0);
      await twoFrames(page);
    }

    const nachher = await measure(page);
    expect(nachher.backingH).toBe(vorher.cssH);
    expect(nachher.brightness).toBeGreaterThan(1);
  });

  test("echter Größenwechsel wird übernommen und sofort neu gezeichnet", async ({ page }) => {
    await settle(page);
    const nachher = await page.evaluate(() => {
      const c = document.querySelector("canvas") as HTMLCanvasElement;
      c.style.height = c.clientHeight - 120 + "px";
      window.dispatchEvent(new Event("resize"));
      // Synchron gemessen: der Repaint muss im selben Task passiert sein,
      // sonst sieht der Nutzer einen schwarzen Frame.
      const ctx = c.getContext("2d")!;
      let sum = 0;
      for (let i = 0; i < 150; i++) {
        const d = ctx.getImageData(Math.floor((i * 37) % c.width), Math.floor((i * 53) % c.height), 1, 1).data;
        sum += d[0] + d[1] + d[2];
      }
      return { brightness: sum / 150, backingH: c.height, cssH: c.clientHeight };
    });
    expect(nachher.backingH, "echte Box-Änderung wurde nicht übernommen").toBe(nachher.cssH);
    expect(nachher.brightness, "nach echtem Resize blieb der Canvas schwarz").toBeGreaterThan(1);
  });
});

test.describe("Hintergrund-Canvas (prefers-reduced-motion)", () => {
  // Der kritischste Fall: hier läuft KEINE Animationsschleife, ein geleerter
  // Canvas bliebe also dauerhaft schwarz statt nur für einen Frame.
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("bleibt nach Adressleisten- und echtem Resize sichtbar", async ({ page }) => {
    await settle(page);
    expect((await measure(page)).brightness).toBeGreaterThan(1);

    await stubShorterInnerHeight(page, 120);
    await twoFrames(page);
    expect((await measure(page)).brightness, "nach Adressleisten-Resize schwarz").toBeGreaterThan(1);

    await page.evaluate(() => {
      const c = document.querySelector("canvas") as HTMLCanvasElement;
      c.style.height = c.clientHeight - 120 + "px";
      window.dispatchEvent(new Event("resize"));
    });
    await page.waitForTimeout(200);
    expect((await measure(page)).brightness, "nach echtem Resize schwarz").toBeGreaterThan(1);
  });
});
