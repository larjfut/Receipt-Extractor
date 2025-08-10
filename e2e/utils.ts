import { Page } from '@playwright/test'

export async function msalLogin(page: Page) {
  const [popup] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByRole('button', { name: /sign in/i }).click()
  ])

  await popup.waitForLoadState()

  const user = process.env.TEST_ACCOUNT_USER
  const pass = process.env.TEST_ACCOUNT_PASS

  if (user && pass) {
    await popup.getByLabel(/email|phone|skype/i).fill(user)
    await popup.getByRole('button', { name: /next/i }).click()
    await popup.getByLabel(/password/i).fill(pass)
    await popup.getByRole('button', { name: /sign in/i }).click()
  }

  try {
    await popup.getByRole('button', { name: /yes/i }).click({ timeout: 5000 })
  } catch {}

  await popup.waitForClose({ timeout: 15000 })
}
