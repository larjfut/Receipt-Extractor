import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const startUrl = process.env.E2E_BASE_URL || ''
const baseOrigin = startUrl ? new URL(startUrl).origin : ''
const date = new Date().toISOString().split('T')[0]
const artifactRoot = path.join('ui-artifacts', date)
fs.mkdirSync(artifactRoot, { recursive: true })

test('authenticated crawl', async ({ page }, testInfo) => {
  const visited = new Set<string>()
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }]

  while (queue.length) {
    const { url, depth } = queue.shift()!
    if (visited.has(url) || depth > 2) continue
    visited.add(url)

    const consoleMessages: string[] = []
    const badResponses: string[] = []

    const consoleListener = (msg: any) => {
      if (msg.type() === 'error' || (msg.type() === 'warning' && /hydration/i.test(msg.text()))) {
        consoleMessages.push(msg.text())
      }
    }
    const responseListener = (resp: any) => {
      if (resp.status() >= 400) badResponses.push(`${resp.url()} ${resp.status()}`)
    }
    page.on('console', consoleListener)
    page.on('response', responseListener)

    const response = await page.goto(url)
    expect(response?.status(), `status for ${url}`).toBeLessThan(400)
    await page.waitForLoadState('networkidle')

    expect(badResponses, `HTTP errors for ${url}: ${badResponses.join(', ')}`).toEqual([])
    expect(consoleMessages, `Console errors for ${url}: ${consoleMessages.join(', ')}`).toEqual([])

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    const headingCount = await page.locator('h1, h2').count()
    expect(headingCount, `no h1/h2 at ${url}`).toBeGreaterThan(0)

    const resources = await page.evaluate(() => {
      const urls: string[] = []
      document.querySelectorAll('img[src]').forEach(e => urls.push((e as HTMLImageElement).src))
      document.querySelectorAll('link[rel="stylesheet"]').forEach(e => urls.push((e as HTMLLinkElement).href))
      document.querySelectorAll('script[src]').forEach(e => urls.push((e as HTMLScriptElement).src))
      return urls
    })
    for (const resUrl of resources) {
      const absolute = new URL(resUrl, baseOrigin).href
      const res = await page.request.get(absolute)
      expect(res.status(), `${absolute} failed`).toBe(200)
    }

    const safeName = url.replace(baseOrigin, '').replace(/[^a-z0-9]+/gi, '_') || 'home'
    await page.screenshot({ path: path.join(artifactRoot, `${safeName}-${testInfo.project.name}.png`), fullPage: true })

    page.off('console', consoleListener)
    page.off('response', responseListener)

    if (depth < 2) {
      const links = await page.$$eval('a[href]', els => els.map(e => (e as HTMLAnchorElement).href))
      for (const link of links) {
        const absolute = new URL(link, baseOrigin).href
        if (absolute.startsWith(baseOrigin) && !visited.has(absolute)) {
          queue.push({ url: absolute, depth: depth + 1 })
        }
      }
    }
  }
})
