import { defineConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const date = new Date().toISOString().split('T')[0]
const artifactsDir = path.join('ui-artifacts', date)
fs.mkdirSync(artifactsDir, { recursive: true })

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  retries: process.env.CI ? 2 : 0,
  globalSetup: require.resolve('./tests/global.setup'),
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    storageState: '.auth/state.json'
  },
  projects: [
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 800 },
        recordHar: { path: path.join(artifactsDir, 'desktop.har') }
      }
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        recordHar: { path: path.join(artifactsDir, 'tablet.har') }
      }
    },
    {
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
        recordHar: { path: path.join(artifactsDir, 'mobile.har') }
      }
    }
  ]
})
