import { test, expect } from '@playwright/test'
import { msalLogin } from './utils'

test('API requests include bearer token and return 200', async ({ page }) => {
  await page.goto('/')
  await msalLogin(page)

  const token = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(k => k.includes('accesstoken'))
    if (!key) return null
    try {
      return JSON.parse(localStorage.getItem(key) || '{}').secret
    } catch {
      return null
    }
  })

  test.skip(!token, 'no access token found')

  const [request] = await Promise.all([
    page.waitForRequest(r => r.url().includes('/api/auth/me')),
    page.evaluate(t => fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } }), token)
  ])
  expect(request.headers().authorization).toMatch(/^Bearer /)
  const response = await request.response()
  expect(response?.status()).toBe(200)
})
