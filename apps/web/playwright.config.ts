import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test/e2e',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3101' },
  reporter: 'list',
  webServer: [
    { command: 'npx tsx test/fixture-server.ts', url: 'http://127.0.0.1:4011/_test/health', reuseExistingServer: false },
    { command: 'npx next start --hostname 127.0.0.1 --port 3101', url: 'http://127.0.0.1:3101', reuseExistingServer: false,
      env: { PORTFOLIO_API_URL: 'http://127.0.0.1:4011/api/v1', SITE_URL: 'http://127.0.0.1:3101' } },
  ],
});
