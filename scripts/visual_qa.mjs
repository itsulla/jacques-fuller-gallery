import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const baseUrl = process.env.GALLERY_URL || 'http://100.66.97.100:4176/'
const output = resolve('qa')
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true })
const errors = []

async function makePage(name, viewport, colorScheme = 'light') {
  const context = await browser.newContext({ viewport, colorScheme, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${name}: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`))
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.locator('.monograph-hero__artwork img').waitFor({ state: 'visible' })
  await page.waitForTimeout(850)
  assert.equal(await page.locator('.feature-work').count(), 6)
  assert.equal(await page.locator('.archive-card').count(), 24)
  return { context, page }
}

async function exerciseViewer(page, screenshotName) {
  await page.locator('.monograph-hero__artwork').click()
  await page.locator('[role="dialog"]').waitFor({ state: 'visible' })
  await page.waitForTimeout(550)
  assert.equal(await page.locator('.viewer__position').textContent(), 'Photograph 01 / 11')
  assert.match(page.url(), /#work\/ship-of-fools$/)
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
  assert.equal(await page.locator('.viewer__close').evaluate((node) => node === document.activeElement), true)

  await page.getByRole('button', { name: 'Show next photograph' }).click()
  assert.equal(await page.locator('.viewer__position').textContent(), 'Photograph 02 / 11')
  await page.waitForTimeout(450)
  await page.screenshot({ path: resolve(output, screenshotName), fullPage: false })

  await page.keyboard.press('ArrowLeft')
  assert.equal(await page.locator('.viewer__position').textContent(), 'Photograph 01 / 11')
  await page.keyboard.press('Escape')
  await page.locator('[role="dialog"]').waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => document.body.style.overflow), '')
}

{
  const { context, page } = await makePage('desktop', { width: 1440, height: 1000 })
  await page.screenshot({ path: resolve(output, 'desktop-home.png'), fullPage: false })
  await exerciseViewer(page, 'desktop-viewer.png')

  const cards = page.locator('.archive-card')
  for (let index = 0; index < (await cards.count()); index += 1) {
    await cards.nth(index).scrollIntoViewIfNeeded()
    await page.waitForTimeout(80)
  }
  const readyCards = await page.locator('.archive-card .image-shell--ready').count()
  assert.equal(readyCards, 24)
  await page.locator('.feature-work').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: resolve(output, 'desktop-selected.png'), fullPage: false })
  await context.close()
}

{
  const { context, page } = await makePage('mobile', { width: 390, height: 844 })
  await page.screenshot({ path: resolve(output, 'mobile-home.png'), fullPage: false })
  await exerciseViewer(page, 'mobile-viewer.png')
  await page.locator('#selected-works').scrollIntoViewIfNeeded()
  await page.waitForTimeout(180)
  await page.screenshot({ path: resolve(output, 'mobile-selected.png'), fullPage: false })
  await page.locator('.living-archive').scrollIntoViewIfNeeded()
  await page.waitForTimeout(180)
  await page.screenshot({ path: resolve(output, 'mobile-living-archive.png'), fullPage: false })
  await context.close()
}

{
  const { context, page } = await makePage('dark', { width: 1280, height: 800 }, 'dark')
  const pageBackground = await page.locator('body').evaluate((node) => getComputedStyle(node).backgroundColor)
  assert.notEqual(pageBackground, 'rgb(228, 231, 227)')
  await page.screenshot({ path: resolve(output, 'dark-home.png'), fullPage: false })
  await context.close()
}

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('Visual QA passed: six featured works, 24 archive records, desktop/mobile layouts, viewer interaction, lazy loading, keyboard controls, and dark mode.')
