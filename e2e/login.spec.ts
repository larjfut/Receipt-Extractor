import { test, expect } from '@playwright/test'
import { msalLogin } from './utils'

const userName = process.env.TEST_ACCOUNT_USER || ''

test('MSAL login shows user name', async ({ page }) => {
  await page.goto('/')
  await msalLogin(page)
  await expect(page.getByText(userName, { exact: false })).toBeVisible()
})

test('sign out returns to root and protects routes', async ({ page }) => {
  await page.goto('/')
  await msalLogin(page)
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page).toHaveURL('/')
  await page.goto('/upload')
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})
