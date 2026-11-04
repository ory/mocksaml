import { readFileSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const port = 4010;
const fixture = (name: string) => readFileSync(`tests/fixtures/${name}`).toString('base64');

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  // Production build so the DOM matches what the mocksaml.com synthetic monitor sees.
  webServer: {
    command: `npx next build && npx next start -p ${port}`,
    timeout: 180_000,
    url: `http://localhost:${port}/api/health`,
    reuseExistingServer: !process.env.CI,
    env: {
      APP_URL: `http://localhost:${port}`,
      ENTITY_ID: 'https://idp.test/entityid',
      PUBLIC_KEY: fixture('idp-cert.pem'),
      PRIVATE_KEY: fixture('idp-key.pem'),
    },
  },
});
