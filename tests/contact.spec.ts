import { expect, test } from "@playwright/test";

// The form posts CLIENT-SIDE to Web3Forms (see ContactPage.tsx) — it stopped
// using the Supabase /contact edge endpoint in June 2026. This route pattern
// still pointed at the dead endpoint, so the mock never matched: the two
// submitting tests fired a REAL request at api.web3forms.com on every run,
// delivering live e-mail to info@puron-media.de, and then failed on the
// assertions because the response wasn't the mocked one.
const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";

test.describe("Kontaktformular", () => {
  test("submitted erfolgreich → Vielen-Dank-Screen", async ({ page }) => {
    let payload: unknown = null;
    await page.route(CONTACT_ENDPOINT, async (route) => {
      payload = JSON.parse(route.request().postData() ?? "null");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Email sent successfully" }),
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

    // Field names are the German labels Web3Forms puts in the e-mail body.
    expect(payload).toMatchObject({
      Name: "Max Mustermann",
      Unternehmen: "Muster GmbH",
      "E-Mail": "max@beispiel.de",
      Nachricht: "Test-Nachricht aus dem Playwright-E2E.",
      "Primäres Ziel": "Mehr Sichtbarkeit",
      botcheck: "",
    });
  });

  test("Server-Fehler → Inline-Fehlermeldung, Form bleibt ausgefüllt", async ({ page }) => {
    await page.route(CONTACT_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Too many requests" }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Test");
    await page.getByLabel("E-Mail").fill("test@example.com");
    await page.getByLabel("Worum geht's genau?").fill("Hallo");
    await page.getByRole("button", { name: /anfrage senden/i }).click();

    await expect(page.getByRole("alert")).toContainText("konnte gerade nicht gesendet werden");
    // Vielen-Dank-Screen darf nicht erscheinen
    await expect(page.getByRole("heading", { name: /vielen dank/i })).toHaveCount(0);
    // Form bleibt mit Inhalten erhalten
    await expect(page.getByLabel("Name")).toHaveValue("Test");
  });

  test("Leeres Formular → Inline-Fehler, kein Network-Call", async ({ page }) => {
    let requestMade = false;
    await page.route(CONTACT_ENDPOINT, async (route) => {
      requestMade = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
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
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
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
