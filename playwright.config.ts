import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
  },
  webServer: {
    // `npx vite` instead of `pnpm dev`: pnpm is installed via corepack here and
    // is not always on PATH, in which case Playwright's webServer failed to
    // start ("Der Befehl \"pnpm\" ... konnte nicht gefunden werden") and every
    // test errored before it ran. npx resolves the local vite binary regardless
    // of which package manager is on PATH.
    command: "npx vite",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
