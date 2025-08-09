import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { loginM365 } from './helpers/login-m365'

const storagePath = path.join('.auth', 'state.json')

export default async function globalSetup() {
  const maxAge = 24 * 60 * 60 * 1000
  if (fs.existsSync(storagePath)) {
    const age = Date.now() - fs.statSync(storagePath).mtimeMs
    if (age < maxAge) return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginM365(page)
  await browser.close()
}
