import { expect, test } from "@playwright/test";
import { REVIEWS } from "../src/app/reviews";

// Mobile viewport; the reported bugs were all phone-only.
test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });

test.describe("Google-Rezensionen Karussell (Mobile)", () => {
  test("Bewertung + Anzahl werden angezeigt und verlinken zu Google", async ({ page }) => {
    await page.goto("/");
    // Präzise: die Aggregat-Zeile unter der Überschrift. `/auf Google ansehen/`
    // allein träfe auch jede Karte (deren aria-label endet genauso).
    const link = page.getByRole("link", { name: /^5\.0 \(27 Bewertungen/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^https:\/\/maps\.google\.com\//);

    // Genau EINE Karte pro Rezension im A11y-Baum — die Kopien der Schiene
    // sind aria-hidden und duerfen nicht mehrfach auftauchen.
    await expect(page.getByRole("link", { name: /^Google-Rezension von/ })).toHaveCount(REVIEWS.length);
  });

  test("keine Anfrage an googleusercontent.com (DSGVO)", async ({ page }) => {
    const googleRequests: string[] = [];
    page.on("request", (r) => {
      if (/googleusercontent\.com|fonts\.g(oogleapis|static)\.com/.test(r.url())) googleRequests.push(r.url());
    });

    await page.goto("/");
    await expect(page.getByText(REVIEWS[0].author).first()).toBeVisible();
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
