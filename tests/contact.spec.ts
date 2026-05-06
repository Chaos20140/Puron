import { expect, test } from "@playwright/test";

const CONTACT_ENDPOINT = "**/functions/v1/make-server-1fdc8e05/contact";

test.describe("Kontaktformular", () => {
  test("submitted erfolgreich → Vielen-Dank-Screen", async ({ page }) => {
    let payload: unknown = null;
    await page.route(CONTACT_ENDPOINT, async (route) => {
      payload = JSON.parse(route.request().postData() ?? "null");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Max Mustermann");
    await page.getByLabel("Unternehmen").fill("Muster GmbH");
    await page.getByLabel("E-Mail").fill("max@beispiel.de");
    await page.getByLabel("Worum geht's genau?").fill("Test-Nachricht aus dem Playwright-E2E.");
    await page.getByRole("button", { name: "Mehr Sichtbarkeit" }).click();
    await page.getByRole("button", { name: /anfrage senden/i }).click();

    await expect(page.getByRole("heading", { name: /vielen dank/i })).toBeVisible();

    expect(payload).toMatchObject({
      name: "Max Mustermann",
      company: "Muster GmbH",
      email: "max@beispiel.de",
      message: "Test-Nachricht aus dem Playwright-E2E.",
      goal: "Mehr Sichtbarkeit",
      website: "",
    });
  });

  test("Server-Fehler → Inline-Fehlermeldung, Form bleibt ausgefüllt", async ({ page }) => {
    await page.route(CONTACT_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut." }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Test");
    await page.getByLabel("E-Mail").fill("test@example.com");
    await page.getByLabel("Worum geht's genau?").fill("Hallo");
    await page.getByRole("button", { name: /anfrage senden/i }).click();

    await expect(page.getByRole("alert")).toContainText("Zu viele Anfragen");
    // Vielen-Dank-Screen darf nicht erscheinen
    await expect(page.getByRole("heading", { name: /vielen dank/i })).toHaveCount(0);
    // Form bleibt mit Inhalten erhalten
    await expect(page.getByLabel("Name")).toHaveValue("Test");
  });

  test("Leeres Formular → Inline-Fehler, kein Network-Call", async ({ page }) => {
    let requestMade = false;
    await page.route(CONTACT_ENDPOINT, async (route) => {
      requestMade = true;
      await route.fulfill({ status: 200, body: "{}" });
    });

    await page.goto("/contact");
    await page.getByRole("button", { name: /anfrage senden/i }).click();

    // Drei required-Felder: name, email, message — alle zeigen Fehler
    await expect(page.getByText(/Bitte gib deinen Namen an/i)).toBeVisible();
    await expect(page.getByText(/Bitte gib deine E-Mail-Adresse an/i)).toBeVisible();
    await expect(page.getByText(/Bitte beschreibe kurz dein Anliegen/i)).toBeVisible();

    // Kein Submit ans Backend
    expect(requestMade).toBe(false);
    // Kein Vielen-Dank
    await expect(page.getByRole("heading", { name: /vielen dank/i })).toHaveCount(0);
  });

  test("Invalide E-Mail → Inline-Fehler, kein Submit", async ({ page }) => {
    let requestMade = false;
    await page.route(CONTACT_ENDPOINT, async (route) => {
      requestMade = true;
      await route.fulfill({ status: 200, body: "{}" });
    });

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Max");
    await page.getByLabel("E-Mail").fill("kein-at-zeichen-und-keine-domain");
    await page.getByLabel("Worum geht's genau?").fill("Test");
    await page.getByRole("button", { name: /anfrage senden/i }).click();

    await expect(page.getByText(/sieht nicht wie eine gültige E-Mail aus/i)).toBeVisible();
    expect(requestMade).toBe(false);
  });
});
