import { defineConfig } from "@playwright/test";

const phone = { width: 390, height: 844 };
const port = Number(process.env.HELIOPOLY_E2E_PORT ?? 5178);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [["line", { printSteps: false }]],
  outputDir: "test-results",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "off",
    video: "off",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    {
      name: "phone-chromium",
      use: {
        browserName: "chromium",
        viewport: phone,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "phone-webkit",
      use: {
        browserName: "webkit",
        viewport: phone,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "wide-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1200, height: 800 },
        hasTouch: false,
        isMobile: false,
      },
    },
  ],
});
