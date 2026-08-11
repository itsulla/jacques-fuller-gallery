import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, readFile, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, resolve, sep } from 'node:path'
import assert from 'node:assert/strict'

const distRoot = resolve('dist')
const outputDir = resolve('.impeccable/qa')
await mkdir(outputDir, { recursive: true })
const sourceArtworks = JSON.parse(await readFile(resolve('src/data/artworks.json'), 'utf8'))
const currentArchiveCount = sourceArtworks.length

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

async function createLocalArtifactServer() {
  const realDistRoot = await realpath(distRoot)
  const index = await readFile(resolve(realDistRoot, 'index.html'))
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1')
      const pathname = decodeURIComponent(url.pathname)
      const candidate = resolve(realDistRoot, `.${pathname}`)
      if (candidate !== realDistRoot && !candidate.startsWith(`${realDistRoot}${sep}`)) {
        response.writeHead(400)
        response.end('Bad request')
        return
      }

      const info = await stat(candidate).catch(() => null)
      const file = info?.isFile() ? await realpath(candidate) : null
      if (file && file !== realDistRoot && !file.startsWith(`${realDistRoot}${sep}`)) {
        response.writeHead(403)
        response.end('Forbidden')
        return
      }
      const body = file ? await readFile(file) : index
      response.writeHead(200, {
        'Content-Type': file ? contentTypes.get(extname(file)) || 'application/octet-stream' : 'text/html; charset=utf-8',
      })
      response.end(body)
    } catch (error) {
      response.writeHead(500)
      response.end('Internal server error')
      console.error(error)
    }
  })

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const address = server.address()
  assert(address && typeof address !== 'string')
  return { baseUrl: `http://127.0.0.1:${address.port}`, server }
}

let baseUrl = process.env.GALLERY_URL
let localServer = null
let browser = null

function collectErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('static.cloudflareinsights.com')) errors.push(message.text())
  })
  page.on('requestfailed', (request) => {
    if (!request.url().includes('static.cloudflareinsights.com')) errors.push(`${request.url()}: ${request.failure()?.errorText}`)
  })
  return errors
}

async function exerciseServerContainment() {
  if (!localServer) return
  const fixture = await mkdtemp(join(tmpdir(), 'jf-qa-containment-'))
  const secret = `outside-dist-${Date.now()}`
  const secretPath = join(fixture, 'secret.txt')
  const linkPath = resolve(distRoot, `.qa-symlink-${Date.now()}.txt`)
  await writeFile(secretPath, secret)
  await symlink(secretPath, linkPath)
  try {
    const response = await fetch(`${baseUrl}/${linkPath.split('/').at(-1)}`)
    assert.equal(response.status, 403, 'The QA server must reject symlinks that resolve outside dist')
    assert.notEqual(await response.text(), secret, 'The QA server exposed a file outside dist through a symlink')
  } finally {
    await rm(linkPath, { force: true })
    await rm(fixture, { force: true, recursive: true })
  }
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  assert.ok(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} overflows horizontally: ${JSON.stringify(dimensions)}`)
}

async function exerciseSingleSiteMosaic() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?qa=single-site-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.locator('.direction--immersive').waitFor({ state: 'visible' })
  assert.equal(await page.locator('.design-lab').count(), 0, 'The retired design lab is still visible')
  assert.equal(await page.locator('.r5-mosaic').count(), 1, 'The Direction 6 mosaic was not promoted into Direction 5')
  const mosaicButtons = page.locator('.r5-mosaic .artwork-button')
  assert.equal(await mosaicButtons.count(), 6, 'The opening mosaic must expose six selected photographs')
  const mosaicImages = mosaicButtons.locator('img')
  await page.waitForFunction(() => {
    const images = [...document.querySelectorAll('.r5-mosaic .artwork-button img')]
    return images.length === 6 && images.every((image) => image.complete && image.naturalWidth > 0)
  })
  assert.deepEqual(
    await mosaicImages.evaluateAll((images) => images.map((image) => new URL(image.currentSrc).pathname)),
    [
      '/artworks/beaurocrat/view-07.webp',
      '/artworks/ship-of-fools/view-01.webp',
      '/artworks/government-of-national-unity/view-01.webp',
      '/homepage/reference-04.webp',
      '/artworks/kingfisher/view-01.webp',
      '/homepage/reference-06.webp',
    ],
    'The homepage mosaic must preserve the six user-selected photographs in supplied order',
  )
  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' })
  assert.deepEqual(await primaryNavigation.locator('button, a').allTextContents(), ['Works', 'Process', 'About'], 'Primary navigation must use the minimal artist-led structure')
  assert.ok(
    Number.parseFloat(await primaryNavigation.getByRole('button', { name: 'Works', exact: true }).evaluate((node) => getComputedStyle(node).fontSize)) >= 12,
    'Primary navigation controls must meet the 12px operational text floor',
  )
  assert.equal(await page.locator('.r5-stage').count(), 0, 'The former Direction 5 stage should be replaced by the mosaic')
  assert.equal(await page.locator('.direction h1').count(), 1, 'The final site needs exactly one H1')
  assert.equal(await page.locator('.r5-archive-gateway .artwork-button').count(), 4, 'The current-archive gateway must expose four representative works')
  assert.equal(await page.locator('.r5-archive-gateway__works article > p').count(), 0, 'The homepage work strip must not expose reference-code captions')
  assert.equal(await page.locator('.r5-rail, .r5-browser').count(), 0, 'The homepage must not duplicate the complete catalogue')
  assert.equal(await page.getByText('Work in motion', { exact: true }).count(), 0, 'Retired motion copy returned')
  const navSurface = await page.locator('.direction-nav').evaluate((element) => getComputedStyle(element).backgroundColor)
  assert.notEqual(navSurface, 'rgba(0, 0, 0, 0)', 'The hero navigation must own a deterministic contrast surface')
  await assertNoOverflow(page, 'Final homepage desktop')
  await page.screenshot({ path: resolve(outputDir, 'final-home-desktop.png') })

  for (const index of [3, 5]) {
    await mosaicButtons.nth(index).click()
    const referenceGallery = page.locator('.archive-index[role="dialog"]')
    await referenceGallery.waitFor({ state: 'visible' })
    assert.equal(await referenceGallery.locator('.archive-index__gallery > li').count(), currentArchiveCount, 'A standalone reference tile must open the complete Works gallery')
    await referenceGallery.getByRole('button', { name: 'Close', exact: true }).click()
    await referenceGallery.waitFor({ state: 'detached' })
  }

  await page.getByRole('button', { name: `View all ${currentArchiveCount} works` }).click()
  const archiveIndex = page.locator('.archive-index[role="dialog"]')
  await archiveIndex.waitFor({ state: 'visible' })
  await archiveIndex.evaluate(async (dialog) => {
    await Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished))
  })
  const worksGallery = archiveIndex.locator('.archive-index__gallery')
  assert.equal(await worksGallery.locator(':scope > li').count(), currentArchiveCount, 'The Works gallery must expose every current work')
  assert.equal(await page.locator('.app-surface').evaluate((surface) => surface.inert), true, 'The Works gallery must make the page inert')
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Close', 'Opening Works must focus Close')
  assert.equal(await archiveIndex.getByRole('searchbox').count(), 0, 'The Works gallery must not expose search')
  assert.equal(await worksGallery.evaluate((gallery) => getComputedStyle(gallery).gridTemplateColumns.split(' ').length), 3, 'Desktop Works must use three large-image columns')
  const firstGalleryImage = worksGallery.locator('img').first()
  await firstGalleryImage.waitFor({ state: 'visible' })
  await page.waitForFunction((image) => image.complete && image.naturalWidth > 0, await firstGalleryImage.elementHandle())
  const firstGalleryImageWidth = await firstGalleryImage.evaluate((image) => image.getBoundingClientRect().width)
  assert.ok(firstGalleryImageWidth >= 300, `Desktop Works images are still too small (${firstGalleryImageWidth}px)`)
  const firstGalleryImageHeight = await firstGalleryImage.evaluate((image) => image.getBoundingClientRect().height)
  assert.ok(Math.abs(firstGalleryImageWidth - firstGalleryImageHeight) <= 1, 'Works must use square image wells so portrait sculptures remain visually large')
  assert.ok(new URL(await firstGalleryImage.getAttribute('src'), page.url()).pathname.endsWith('/view-01.webp'), 'Works must load the full lead image rather than a thumbnail file')
  await page.screenshot({ path: resolve(outputDir, 'works-gallery-desktop.png') })
  const lastGalleryImage = worksGallery.locator('img').last()
  await lastGalleryImage.scrollIntoViewIfNeeded()
  await page.waitForFunction((image) => image.complete && image.naturalWidth > 0, await lastGalleryImage.elementHandle())
  await archiveIndex.getByRole('button', { name: 'Close', exact: true }).click()
  await archiveIndex.waitFor({ state: 'detached' })
  assert.equal(new URL(page.url()).hash, '', 'Closing Works must clear its durable URL')
  assert.equal(await page.locator('.app-surface').evaluate((surface) => surface.inert), false, 'Closing Works must restore the page')
  const endState = page.locator('.direction-footer')
  await endState.scrollIntoViewIfNeeded()
  assert.equal(await endState.getByText('Sculpture', { exact: true }).count(), 1, 'The homepage has no deliberate end state')
  assert.equal(await endState.getByRole('button', { name: 'View all works' }).count(), 1, 'The homepage ending has no continuation action')

  await page.goto(`${baseUrl}/?direction=6&qa=retired-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.locator('.direction--immersive').waitFor({ state: 'visible' })
  assert.equal(await page.locator('.direction--synthesis, .direction--essential').count(), 0, 'A retired demo is still reachable')
  assert.deepEqual(errors, [], 'The final homepage emitted browser errors')
  await context.close()
}

async function exerciseProcessRoute() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?qa=process-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Process', exact: true }).click()
  await page.locator('.r5-process').waitFor({ state: 'visible' })
  assert.ok(page.url().includes('page=process'), 'Process navigation did not create a durable URL')
  assert.equal(await page.title(), 'Jacques Fuller · Process', 'Process page title is incorrect')
  assert.equal(await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Process', exact: true }).getAttribute('aria-current'), 'page', 'The Process page does not identify its active navigation item')
  assert.equal(await page.locator('.r5-process__stage').count(), 4, 'Process must show four making stages')
  assert.equal(await page.locator('.r5-process__voice').count(), 2, 'Process must distinguish two passages in Jacques’s own voice')
  assert.equal(await page.locator('.r5-process__material-history').count(), 1, 'Process is missing the dated material history')
  assert.equal(await page.getByText('I prefer working directly with metal and having control of the entire process.', { exact: true }).count(), 1, 'Process lost Jacques’s direct-to-metal account')
  assert.equal(await page.locator('.r5-process__voice cite').filter({ hasText: 'Jacques Fuller' }).count(), 2, 'Process quotations must read as Jacques’s own voice')
  const processImages = page.locator('.r5-process__stage img')
  assert.equal(await processImages.count(), 12, 'Process must show all twelve selected workshop photographs')
  assert.ok(await processImages.evaluateAll((images) => images.every((image) => new URL(image.src).pathname.startsWith('/process/mermaid/'))), 'Process is not using local workshop photographs')
  const processBodySize = await page.locator('.r5-process__stage > header > p:last-child').first().evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))
  assert.ok(processBodySize >= 16, `Process prose is still too small for sustained reading: ${processBodySize}px`)
  assert.equal(await page.getByRole('heading', { name: 'Making Mermaid' }).count(), 1, 'Process lost the identified sculpture')
  await assertNoOverflow(page, 'Process desktop')

  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.r5-process').waitFor({ state: 'visible' })
  assert.equal(await page.getByRole('button', { name: 'View finished Mermaid' }).count(), 1, 'Process lost its finished-work entry point')
  await page.getByRole('button', { name: 'View finished Mermaid' }).click()
  await page.locator('.viewer[role="dialog"]').waitFor({ state: 'visible' })
  await page.keyboard.press('Escape')
  await page.locator('.viewer[role="dialog"]').waitFor({ state: 'detached' })
  assert.ok(await page.getByRole('button', { name: 'View finished Mermaid' }).evaluate((button) => button === document.activeElement), 'Closing the viewer did not restore focus')
  assert.deepEqual(errors, [], 'Process emitted browser errors')
  await context.close()
}

async function exerciseFirstPartyPresentation() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?qa=first-party-${Date.now()}`, { waitUntil: 'networkidle' })
  const bodyText = (await page.locator('body').innerText()).toLowerCase()
  for (const phrase of ['archive', '2001', 'catalogue', 'source:']) {
    assert.equal(bodyText.includes(phrase), false, `Public homepage still exposes third-party language: ${phrase}`)
  }
  assert.equal(await page.locator('.r5-archive').count(), 0, 'The public historical research section must be removed')
  assert.equal(await page.getByRole('heading', { name: 'Works', exact: true }).count(), 1, 'The homepage needs one direct Works heading')
  const about = page.locator('#about')
  assert.equal(await about.getByRole('heading', { name: 'About Jacques', exact: true }).count(), 1, 'About needs the personal title from the approved reference')
  assert.equal(await about.getByText(/In 1989 he began working full-time as a sculptor/).count(), 1, 'The direct biography is missing Jacques’s full-time practice')
  assert.equal(await about.getByText(/Jacques works directly in metal/).count(), 1, 'About is missing the supported practice detail')
  assert.equal(await about.locator('.about-copy__timeline > li').count(), 6, 'About must expose all six supported career milestones')
  assert.deepEqual(await about.locator('.about-copy__timeline > li > p').allTextContents(), ['1979', '1981-82', '1983', '1984', '1988', '1989-present'], 'About timeline dates are out of order')
  assert.equal(await about.locator('.about-copy__body').evaluate((body) => getComputedStyle(body).gridTemplateColumns.split(' ').length), 2, 'Desktop About must use the reference two-column biography and timeline layout')
  const aboutColumns = await about.locator('.about-copy__body').evaluate((body) => {
    const prose = body.querySelector('.about-copy__prose').getBoundingClientRect()
    const timeline = body.querySelector('.about-copy__timeline').getBoundingClientRect()
    return { proseLeft: prose.left, timelineLeft: timeline.left }
  })
  assert.ok(aboutColumns.proseLeft < aboutColumns.timelineLeft, 'Desktop biography must sit to the left of the career timeline')
  assert.equal(await about.locator('footer').count(), 0, 'About must not expose research-source footnotes')
  await about.screenshot({ path: resolve(outputDir, 'about-timeline-desktop.png') })

  const sectionOrder = await page.evaluate(() => {
    const worksTop = document.querySelector('#works').getBoundingClientRect().top + window.scrollY
    const aboutTop = document.querySelector('#about').getBoundingClientRect().top + window.scrollY
    return { worksTop, aboutTop }
  })
  assert.ok(sectionOrder.worksTop < sectionOrder.aboutTop, 'Works must lead directly into About')

  await page.getByRole('button', { name: `View all ${currentArchiveCount} works` }).click()
  const worksIndex = page.locator('.archive-index[role="dialog"]')
  const targetWork = worksIndex.getByRole('button', { name: 'Hoe Ry Die Boere', exact: true })
  await targetWork.scrollIntoViewIfNeeded()
  await targetWork.click()
  const viewer = page.locator('.viewer[role="dialog"]')
  await viewer.waitFor({ state: 'visible' })
  const viewerText = (await viewer.innerText()).toLowerCase()
  for (const phrase of ['archive', '2001', 'catalogue', 'source:', 'not recorded', 'research pending']) {
    assert.equal(viewerText.includes(phrase), false, `Artwork details still expose research language: ${phrase}`)
  }
  await page.keyboard.press('Escape')
  assert.deepEqual(errors, [], 'First-party presentation emitted browser errors')
  await context.close()
}

async function exerciseArtworkRecord() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?page=process&qa=record-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'View finished Mermaid' }).click()
  const viewer = page.locator('.viewer[role="dialog"]')
  await viewer.waitFor({ state: 'visible' })
  const closeWidth = await viewer.getByRole('button', { name: 'Close', exact: true }).evaluate((node) => node.getBoundingClientRect().width)
  assert.ok(closeWidth <= 160, `The focused desktop Close control is visually oversized (${closeWidth}px)`)
  const mainImage = viewer.locator('.viewer__stage img')
  await mainImage.waitFor({ state: 'visible' })
  assert.ok(await mainImage.evaluate((image) => image.complete && image.naturalWidth > 0), 'The main artwork image did not load')
  const thumbs = viewer.locator('.viewer__thumbs button')
  assert.equal(await thumbs.count(), 9, 'Mermaid must expose all nine available photographic views')
  const thumbVisibility = await thumbs.evaluateAll((buttons) => buttons.map((button) => {
    const box = button.getBoundingClientRect()
    return { top: box.top, right: box.right, bottom: box.bottom, left: box.left }
  }))
  const viewport = page.viewportSize()
  assert.ok(thumbVisibility.every((box) => box.top >= 0 && box.bottom <= viewport.height && box.left >= 0 && box.right <= viewport.width), 'All smaller images must be visible with the main image before scrolling on desktop')
  await thumbs.nth(1).click()
  assert.ok(await thumbs.nth(1).evaluate((button) => button.classList.contains('is-active')), 'Selecting a smaller image did not update the active view')

  const record = viewer.locator('.viewer__record')
  assert.equal(await record.count(), 1, 'The scrollable work record is missing')
  assert.equal(await record.getByRole('heading', { name: 'Details' }).count(), 1, 'The record has no minimal details heading')
  assert.equal(await record.locator('dt').count(), 3, 'Mermaid must show only known material, dimensions, and image count')
  assert.equal(await record.locator('.viewer__record-key, .viewer__record-notes, .viewer__historical').count(), 0, 'Research apparatus must not appear in the public viewer')
  assert.equal(await record.getByText('Not recorded', { exact: true }).count(), 0, 'Unknown facts must be omitted rather than displayed')
  const positions = await page.evaluate(() => {
    const thumbsBox = document.querySelector('.viewer__thumbs').getBoundingClientRect()
    const recordBox = document.querySelector('.viewer__record').getBoundingClientRect()
    return { thumbsBottom: thumbsBox.bottom + window.scrollY, recordTop: recordBox.top + window.scrollY }
  })
  assert.ok(positions.recordTop >= positions.thumbsBottom, 'Details appear before the complete image sequence')
  await record.scrollIntoViewIfNeeded()
  await record.screenshot({ path: resolve(outputDir, 'artwork-record-desktop.png') })
  await page.keyboard.press('Escape')
  assert.deepEqual(errors, [], 'Artwork record emitted browser errors')
  await context.close()
}

async function exerciseViewerHistory() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?qa=viewer-history-${Date.now()}`, { waitUntil: 'networkidle' })
  const trigger = page.locator('.r5-mosaic .artwork-button').first()
  const historyLength = await page.evaluate(() => window.history.length)
  await trigger.click()
  const viewer = page.locator('.viewer[role="dialog"]')
  await viewer.waitFor({ state: 'visible' })
  assert.equal(await page.evaluate(() => window.history.length), historyLength + 1, 'Opening a work must create a browser history entry')
  assert.match(new URL(page.url()).hash, /^#work\//, 'Opening a work must expose its durable hash URL')
  assert.ok(await page.locator('.app-surface').evaluate((surface) => surface.inert), 'Opening a work must make the background inert')

  await page.goBack({ waitUntil: 'commit' })
  await viewer.waitFor({ state: 'detached' })
  assert.equal(new URL(page.url()).hash, '', 'Browser Back must close the work URL')
  assert.ok(!await page.locator('.app-surface').evaluate((surface) => surface.inert), 'Browser Back must restore the page background')

  await page.goForward({ waitUntil: 'commit' })
  await viewer.waitFor({ state: 'visible' })
  assert.match(new URL(page.url()).hash, /^#work\//, 'Browser Forward must restore the work URL')
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await viewer.waitFor({ state: 'detached' })
  assert.equal(new URL(page.url()).hash, '', 'The Close control must clear the work URL')
  assert.ok(await trigger.evaluate((button) => button === document.activeElement), 'The Close control must restore focus to the opening work')
  assert.deepEqual(errors, [], 'Viewer history emitted browser errors')
  await context.close()
}

async function exerciseImageRecovery() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  let failedOnce = false

  await page.route('**/artworks/loan-wolf/view-01.webp*', async (route) => {
    if (!failedOnce) {
      failedOnce = true
      await route.abort('failed')
      return
    }
    await route.continue()
  })

  await page.goto(`${baseUrl}/?qa=image-recovery-${Date.now()}#work/loan-wolf`, { waitUntil: 'networkidle' })
  const viewer = page.locator('.viewer[role="dialog"]')
  await viewer.waitFor({ state: 'visible' })
  assert.equal(await viewer.getByText('Image unavailable', { exact: true }).count(), 1, 'A failed artwork image has no verified error state')
  assert.equal(await viewer.locator('.viewer__thumbs button').count(), 5, 'A failed active image hid the remaining Loan Wolf views')
  await viewer.getByRole('button', { name: 'Retry image' }).click()
  await page.waitForFunction(() => {
    const image = document.querySelector('.viewer__stage img')
    return image?.complete && image.naturalWidth > 0
  })
  assert.equal(await viewer.getByText('Image unavailable', { exact: true }).count(), 0, 'Retry did not clear the artwork error state')
  await context.close()
}

async function exerciseNewSculptures() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)
  const records = [
    ['Icecream NO Just Ice — I Scream NO Justice', 'JF-025', 5],
    ['Loan Wolf', 'JF-026', 5],
    ['Dragonet', 'JF-027', 3],
    ['Dunce', 'JF-028', 4],
    ['BE...', 'JF-029', 5],
    ['Hoe Ry Die Boere', 'JF-030', 4],
    ['Government of National Unity', 'JF-031', 6],
    ['Vorsprung durch Technik', 'JF-032', 4],
    ['BELLE', 'JF-033', 5],
    ['Symbiosis', 'JF-034', 4],
    ['Ministry', 'JF-035', 7],
    ['Pelican', 'JF-036', 7],
    ['Parliamentarian', 'JF-037', 6],
    ['RSM', 'JF-038', 9],
    ['Tutu', 'JF-039', 5],
    ['Servamus et Servimus', 'JF-040', 4],
    ['Jewellery', 'JF-041', 21],
    ['CONNOISSEUR', 'JF-042', 4],
    ['SUMMER TIME', 'JF-043', 5],
    ['Tourist', 'JF-044', 6],
    ['Uil Spieël', 'JF-045', 5],
    ['HYPOCRITE', 'JF-046', 7],
    ['Kingfisher', 'JF-047', 7],
    ['MANTIS', 'JF-048', 7],
    ['Homo erectus', 'JF-049', 4],
    ['The End of the Game', 'JF-050', 5],
    ['PANZER', 'JF-051', 4],
  ]

  await page.goto(`${baseUrl}/?qa=new-sculptures-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `View all ${currentArchiveCount} works` }).click()
  for (const [title, archiveNumber, viewCount] of records) {
    const card = page.locator('.archive-index__gallery > li').filter({ hasText: title })
    assert.equal(await card.count(), 1, `${title} is missing from the visual Works gallery`)
    await card.scrollIntoViewIfNeeded()
    await card.locator('button').click()
    const viewer = page.locator('.viewer[role="dialog"]')
    await viewer.waitFor({ state: 'visible' })
    assert.equal(await viewer.getByRole('heading', { name: title, exact: true }).count(), 1, `${title} opened the wrong record`)
    const thumbs = viewer.locator('.viewer__thumbs button')
    assert.equal(await thumbs.count(), viewCount, `${title} must expose every supplied view`)
    await page.waitForFunction((expectedCount) => {
      const images = [...document.querySelectorAll('.viewer__thumbs img')]
      return images.length === expectedCount && images.every((image) => image.complete && image.naturalWidth > 0)
    }, viewCount)
    assert.ok(await thumbs.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), `${title} has an unloaded thumbnail`)
    const loadedViews = []
    for (let index = 0; index < viewCount; index += 1) {
      await thumbs.nth(index).click()
      await page.waitForFunction((activeIndex) => {
        const buttons = [...document.querySelectorAll('.viewer__thumbs button')]
        return buttons[activeIndex]?.getAttribute('aria-current') === 'true'
      }, index)
      const stageImage = viewer.locator('.viewer__stage img')
      await stageImage.waitFor({ state: 'visible' })
      await stageImage.evaluate(async (image) => {
        if (!image.complete) {
          await new Promise((resolveImage, rejectImage) => {
            image.addEventListener('load', resolveImage, { once: true })
            image.addEventListener('error', () => rejectImage(new Error(`Failed to load ${image.currentSrc}`)), { once: true })
          })
        }
        if (!image.naturalWidth) throw new Error(`Image has no decoded pixels: ${image.currentSrc}`)
        await image.decode()
      })
      loadedViews.push(await stageImage.getAttribute('src'))
    }
    assert.equal(new Set(loadedViews).size, viewCount, `${title} did not expose every distinct full image`)
    const facts = await viewer.locator('.viewer__record-facts > div').evaluateAll((rows) => Object.fromEntries(rows.map((row) => [row.querySelector('dt')?.textContent, row.querySelector('dd')?.textContent])))
    const expectedFacts = archiveNumber === 'JF-030'
      ? { Date: '2000', Material: 'Brass', Dimensions: '78 × 93 cm', 'Photographic views': `${viewCount}` }
      : archiveNumber === 'JF-041'
        ? { 'Photo credit': 'Marie Girard', 'Photographic images': '21' }
        : { 'Photographic views': `${viewCount}` }
    for (const [label, expected] of Object.entries(expectedFacts)) {
      assert.equal(facts[label], expected, `${title} has the wrong ${label.toLowerCase()} value`)
    }
    if (archiveNumber === 'JF-041') {
      assert.equal(await viewer.getByRole('heading', { name: 'Collection', exact: true }).count(), 1, 'Jewellery must be identified as a collection')
    } else {
      assert.equal(await viewer.getByRole('heading', { name: 'Details', exact: true }).count(), 1, `${title} must use the minimal details heading`)
    }
    assert.equal(await viewer.locator('.viewer__record-key, .viewer__record-notes, .viewer__historical').count(), 0, `${title} exposes research apparatus`)
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await viewer.waitFor({ state: 'detached' })
    await page.locator('.archive-index[role="dialog"]').waitFor({ state: 'visible' })
  }
  assert.deepEqual(errors, [], 'The new sculpture records emitted browser errors')
  await context.close()
}

async function exerciseMobileSite() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?qa=mobile-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.locator('.r5-mosaic').waitFor({ state: 'visible' })
  assert.equal(await page.locator('.r5-mosaic .artwork-button').count(), 6, 'Mobile mosaic lost a selected work')
  assert.equal(await page.locator('.r5-mosaic').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length), 2, 'Mobile mosaic must collapse to two columns')
  const identityContainment = await page.locator('.r5-mosaic__identity').evaluate((element) => {
    const owner = element.getBoundingClientRect()
    const children = [...element.children].map((child) => child.getBoundingClientRect())
    return {
      ownerTop: owner.top,
      ownerBottom: owner.bottom,
      childTop: Math.min(...children.map((child) => child.top)),
      childBottom: Math.max(...children.map((child) => child.bottom)),
    }
  })
  assert.ok(identityContainment.childTop >= identityContainment.ownerTop - 1, `Mobile hero content escapes above its identity plate: ${JSON.stringify(identityContainment)}`)
  assert.ok(identityContainment.childBottom <= identityContainment.ownerBottom + 1, `Mobile hero content escapes below its identity plate: ${JSON.stringify(identityContainment)}`)
  await assertNoOverflow(page, 'Final homepage mobile')
  await page.screenshot({ path: resolve(outputDir, 'final-home-mobile.png') })

  const mobileAbout = page.locator('#about')
  await mobileAbout.scrollIntoViewIfNeeded()
  assert.equal(await mobileAbout.locator('.about-copy__timeline > li').count(), 6, 'Mobile About lost a career milestone')
  assert.equal(await mobileAbout.locator('.about-copy__body').evaluate((body) => getComputedStyle(body).gridTemplateColumns.split(' ').length), 1, 'Mobile About must collapse to one column')
  await mobileAbout.screenshot({ path: resolve(outputDir, 'about-timeline-mobile.png') })

  await page.getByRole('button', { name: `View all ${currentArchiveCount} works` }).click()
  const mobileWorks = page.locator('.archive-index[role="dialog"]')
  await mobileWorks.waitFor({ state: 'visible' })
  await mobileWorks.evaluate(async (dialog) => {
    await Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished))
  })
  await assertNoOverflow(page, 'Works gallery mobile')
  assert.equal(await mobileWorks.getByRole('searchbox').count(), 0, 'Mobile Works must not expose search')
  const mobileGallery = mobileWorks.locator('.archive-index__gallery')
  assert.equal(await mobileGallery.evaluate((gallery) => getComputedStyle(gallery).gridTemplateColumns.split(' ').length), 1, 'Mobile Works must use one large-image column')
  const mobileGalleryImage = mobileGallery.locator('img').first()
  await mobileGalleryImage.waitFor({ state: 'visible' })
  await page.waitForFunction((image) => image.complete && image.naturalWidth > 0, await mobileGalleryImage.elementHandle())
  assert.ok(await mobileGalleryImage.evaluate((image) => image.getBoundingClientRect().width) >= 300, 'Mobile Works images are not large enough to browse clearly')
  const laterMobileImage = mobileGallery.locator('li').nth(8).locator('img')
  await laterMobileImage.scrollIntoViewIfNeeded()
  await page.waitForFunction((image) => image.complete && image.naturalWidth > 0, await laterMobileImage.elementHandle())
  await laterMobileImage.evaluate(async (image) => {
    await image.decode()
    await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)))
  })
  await page.screenshot({ path: resolve(outputDir, 'works-gallery-mobile.png') })
  await mobileWorks.getByRole('button', { name: 'Close', exact: true }).click()

  await page.goto(`${baseUrl}/?page=process&qa=mobile-process-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.locator('.r5-process').waitFor({ state: 'visible' })
  assert.equal(await page.locator('.r5-process__stage').count(), 4, 'Mobile Process lost a stage')
  await assertNoOverflow(page, 'Process mobile')
  await page.screenshot({ path: resolve(outputDir, 'final-process-mobile.png') })
  await page.getByRole('button', { name: 'View finished Mermaid' }).click()
  const record = page.locator('.viewer__record')
  await record.scrollIntoViewIfNeeded()
  await assertNoOverflow(page, 'Artwork record mobile')
  await record.screenshot({ path: resolve(outputDir, 'artwork-record-mobile.png') })
  await page.keyboard.press('Escape')
  assert.deepEqual(errors, [], 'Mobile site emitted browser errors')
  await context.close()
}

try {
  if (!baseUrl) {
    const local = await createLocalArtifactServer()
    baseUrl = local.baseUrl
    localServer = local.server
  }
  browser = await chromium.launch({ headless: true })
  await exerciseServerContainment()
  await exerciseSingleSiteMosaic()
  await exerciseProcessRoute()
  await exerciseFirstPartyPresentation()
  await exerciseArtworkRecord()
  await exerciseViewerHistory()
  await exerciseImageRecovery()
  await exerciseNewSculptures()
  await exerciseMobileSite()
  console.log('Final-site QA passed: artist-led Works presentation, Process, minimal records, motion controls, and mobile.')
} finally {
  if (browser) await browser.close()
  if (localServer) {
    await new Promise((resolveClose, rejectClose) => {
      localServer.close((error) => error ? rejectClose(error) : resolveClose())
    })
  }
}
