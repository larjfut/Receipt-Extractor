import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const storagePath = path.join('.auth', 'state.json')

export async function loginM365(page: Page) {
  const baseUrl = process.env.E2E_BASE_URL || ''
  const username = process.env.E2E_USERNAME || ''
  const password = process.env.E2E_PASSWORD || ''
  const stay = process.env.E2E_STAY_SIGNED_IN === 'yes'

  await page.goto(baseUrl)
  await page.getByRole('button', { name: /sign in/i }).click()

  await page.fill('input[name="loginfmt"]', username)
  await page.getByRole('button', { name: /next/i }).click()

  await page.fill('input[name="passwd"]', password)
  await page.getByRole('button', { name: /sign in/i }).click()

  try {
    await page.getByRole('button', { name: stay ? /yes/i : /no/i }).click({ timeout: 5000 })
  } catch {}

  try {
    await page.getByRole('button', { name: /accept/i }).click({ timeout: 5000 })
  } catch {}

  await page.waitForURL('**/dashboard')

  fs.mkdirSync(path.dirname(storagePath), { recursive: true })
  await page.context().storageState({ path: storagePath })
}
