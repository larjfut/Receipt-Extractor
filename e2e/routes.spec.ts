import { test, expect } from '@playwright/test'
import { msalLogin } from './utils'

const protectedRoutes = ['/upload', '/review', '/signature', '/submit']

test('deep links load and refresh without 404', async ({ page }) => {
  await page.goto('/')
  await msalLogin(page)
  for (const path of protectedRoutes) {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    const reloadRes = await page.reload()
    expect(reloadRes?.status()).toBe(200)
  }
})
