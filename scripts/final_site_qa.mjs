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
  assert.equal(await page.locator('.r5-mosaic .artwork-button').count(), 6, 'The opening mosaic must expose six selected works')
  assert.equal(await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Work', exact: true }).getAttribute('aria-current'), 'page', 'The homepage does not identify its active navigation item')
  assert.ok(
    Number.parseFloat(await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Work', exact: true }).evaluate((node) => getComputedStyle(node).fontSize)) >= 12,
    'Primary navigation controls must meet the 12px operational text floor',
  )
  assert.equal(await page.locator('.r5-stage').count(), 0, 'The former Direction 5 stage should be replaced by the mosaic')
  assert.equal(await page.locator('.direction h1').count(), 1, 'The final site needs exactly one H1')
  assert.equal(await page.locator('.r5-archive-gateway .artwork-button').count(), 4, 'The current-archive gateway must expose four representative works')
  assert.equal(await page.locator('.r5-rail, .r5-browser').count(), 0, 'The homepage must not duplicate the complete catalogue')
  assert.equal(await page.getByText('Work in motion', { exact: true }).count(), 0, 'Retired motion copy returned')
  const navSurface = await page.locator('.direction-nav').evaluate((element) => getComputedStyle(element).backgroundColor)
  assert.notEqual(navSurface, 'rgba(0, 0, 0, 0)', 'The hero navigation must own a deterministic contrast surface')
  await assertNoOverflow(page, 'Final homepage desktop')
  await page.screenshot({ path: resolve(outputDir, 'final-home-desktop.png') })

  await page.getByRole('button', { name: `Browse all ${currentArchiveCount} works` }).click()
  const archiveIndex = page.locator('.archive-index[role="dialog"]')
  await archiveIndex.waitFor({ state: 'visible' })
  assert.equal(await archiveIndex.locator('.archive-index__list > li').count(), currentArchiveCount, 'The archive overlay must expose every current work')
  assert.equal(await page.locator('.app-surface').evaluate((surface) => surface.inert), true, 'The archive overlay must make the page inert')
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('type')), 'search', 'Opening the archive must focus search')
  const search = archiveIndex.getByRole('searchbox', { name: 'Search current archive' })
  await search.fill('BELLE')
  assert.equal(await archiveIndex.locator('.archive-index__list > li').count(), 1, 'Archive search did not filter the complete catalogue')
  assert.equal(await archiveIndex.getByText('BELLE', { exact: true }).count(), 1, 'Archive search returned the wrong work')
  await search.fill('record that does not exist')
  assert.equal(await archiveIndex.getByText('No works match this search.', { exact: true }).count(), 1, 'Archive search has no honest empty state')
  await search.fill('')
  await page.getByRole('button', { name: 'Close archive' }).click()
  await archiveIndex.waitFor({ state: 'detached' })
  assert.equal(new URL(page.url()).hash, '', 'Closing the archive must clear its durable URL')
  assert.equal(await page.locator('.app-surface').evaluate((surface) => surface.inert), false, 'Closing the archive must restore the page')
  const endState = page.locator('.direction-footer')
  await endState.scrollIntoViewIfNeeded()
  assert.equal(await endState.getByText('End of index', { exact: true }).count(), 1, 'The homepage has no deliberate end-of-index state')
  assert.equal(await endState.getByRole('button', { name: 'Open archive index' }).count(), 1, 'The homepage ending has no continuation action')

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
  assert.ok(await page.getByText('Interview with Sharon Crampton · August 2001', { exact: true }).count() >= 1, 'Process quotations are not visibly attributed')
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

async function exerciseHistoricalSpine() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = collectErrors(page)

  await page.goto(`${baseUrl}/?qa=historical-spine-${Date.now()}`, { waitUntil: 'networkidle' })
  const archive = page.locator('#archive')
  await archive.waitFor({ state: 'visible' })
  assert.equal(await archive.getByRole('heading', { name: 'Archive 2001', exact: true }).count(), 1, 'The historical archive has no accessible title')
  assert.equal(await archive.locator('.r5-archive__relationship').count(), 2, 'The archive must distinguish the confirmed object from the reused title')
  assert.equal(await archive.getByText('61 catalogue records', { exact: true }).count(), 1, 'The complete historical record count is missing')
  const archiveChapters = archive.getByRole('navigation', { name: 'Archive 2001 chapters' })
  assert.equal(await archiveChapters.getByRole('link').count(), 3, 'Archive 2001 must expose three explicit subchapters')
  for (const chapter of [
    ['Catalogue context', '#archive-context'],
    ['Recurring forms', '#archive-themes'],
    ['Two identity cases', '#archive-identities'],
  ]) {
    assert.equal(await archiveChapters.getByRole('link', { name: chapter[0], exact: true }).getAttribute('href'), chapter[1], `Archive 2001 is missing the ${chapter[0]} chapter link`)
    assert.equal(await archive.locator(chapter[1]).count(), 1, `Archive 2001 is missing the ${chapter[0]} chapter target`)
  }
  const archiveHeight = await archive.evaluate((element) => element.getBoundingClientRect().height)
  assert.ok(archiveHeight < 3200, `Archive 2001 remains too long to scan as one chapter: ${archiveHeight}px`)
  assert.equal(await archive.getByText('Catalogue no. 10 · same physical work', { exact: true }).count(), 1, 'The confirmed Hoe Ry relationship is missing')
  assert.equal(await archive.getByText('Catalogue no. 58 · different work, same title', { exact: true }).count(), 1, 'The Bwana reused-title relationship is missing')
  assert.equal(await archive.getByText('Current archive · JF-022 · different sculpture', { exact: true }).count(), 1, 'The current Bwana image is not distinguished from the 2001 record')
  assert.equal(await page.getByText('I would rather have someone look at my work twice, three times than have someone merely walk past without giving it a second glance.', { exact: true }).count(), 1, 'The homepage lost Jacques’s look-twice statement')
  assert.equal(await archive.getByText('Interview with Sharon Crampton · August 2001', { exact: true }).count(), 1, 'The homepage quotation is not visibly attributed')
  const about = page.locator('#about')
  assert.equal(await about.getByText('1989 – present', { exact: true }).count(), 1, 'Current full-time sculptor status is missing')

  const sectionOrder = await page.evaluate(() => {
    const currentArchiveTop = document.querySelector('#current-archive').getBoundingClientRect().top + window.scrollY
    const archiveTop = document.querySelector('#archive').getBoundingClientRect().top + window.scrollY
    const aboutTop = document.querySelector('#about').getBoundingClientRect().top + window.scrollY
    return { currentArchiveTop, archiveTop, aboutTop }
  })
  assert.ok(sectionOrder.currentArchiveTop < sectionOrder.archiveTop, 'The current archive gateway must precede the historical archive')
  assert.ok(sectionOrder.archiveTop < sectionOrder.aboutTop, 'Archive 2001 must introduce the historical spine before About')

  await archive.getByRole('button', { name: 'View current Hoe Ry Die Boere' }).click()
  const viewer = page.locator('.viewer[role="dialog"]')
  await viewer.waitFor({ state: 'visible' })
  assert.equal(await viewer.getByRole('heading', { name: 'Historical catalogue record', exact: true }).count(), 1, 'The confirmed work viewer has no historical record')
  assert.equal(await viewer.getByText('JF2001-010', { exact: true }).count(), 1, 'The current work is not linked to its historical ID')
  assert.equal(await viewer.getByText('Collection recorded in 2001', { exact: true }).count(), 1, 'The historical collection value is not dated')
  await page.keyboard.press('Escape')
  assert.deepEqual(errors, [], 'Historical archive emitted browser errors')
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
  assert.equal(await record.getByRole('heading', { name: 'Work record' }).count(), 1, 'The record has no accessible heading')
  assert.equal(await record.locator('dt').count(), 6, 'The record must expose six core catalogue facts')
  for (const heading of ['Working description', 'Catalogue note', "Artist's account", 'Exhibition history', 'Provenance']) {
    assert.equal(await record.getByRole('heading', { name: heading, exact: true }).count(), 1, `The record is missing ${heading}`)
  }
  assert.equal(await record.locator('.viewer__record-key').count(), 1, 'The work record does not explain its public archive states')
  assert.ok(await record.getByText('Not recorded', { exact: true }).count() >= 3, 'Unknown facts are not identified honestly')
  assert.equal(await record.getByText('Research pending.', { exact: true }).count(), 1, 'The catalogue-note research state is missing')
  assert.equal(await record.getByText('Awaiting artist/family account.', { exact: true }).count(), 1, 'The future-testimony state is missing')
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
  ]

  await page.goto(`${baseUrl}/?qa=new-sculptures-${Date.now()}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Browse all ${currentArchiveCount} works` }).click()
  for (const [title, archiveNumber, viewCount] of records) {
    const row = page.locator('.archive-index__list > li').filter({ hasText: title })
    assert.equal(await row.count(), 1, `${title} is missing from the complete title index`)
    await row.locator('button').click()
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
      await page.waitForFunction(
        (activeIndex) => {
          const buttons = [...document.querySelectorAll('.viewer__thumbs button')]
          const image = document.querySelector('.viewer__stage img')
          return buttons[activeIndex]?.getAttribute('aria-current') === 'true' && image?.complete && image.naturalWidth > 0
        },
        index,
      )
      loadedViews.push(await viewer.locator('.viewer__stage img').getAttribute('src'))
    }
    assert.equal(new Set(loadedViews).size, viewCount, `${title} did not expose every distinct full image`)
    assert.equal(await viewer.locator('.viewer__record-facts dd').getByText(archiveNumber, { exact: true }).count(), 1, `${title} has the wrong archive number`)
    const facts = await viewer.locator('.viewer__record-facts > div').evaluateAll((rows) => Object.fromEntries(rows.map((row) => [row.querySelector('dt')?.textContent, row.querySelector('dd')?.textContent])))
    const expectedFacts = archiveNumber === 'JF-030'
      ? { Date: '2000', Material: 'Brass', Dimensions: '78 × 93 cm', Availability: 'Not recorded' }
      : { Date: 'Not recorded', Material: 'Not recorded', Dimensions: 'Not recorded', Availability: 'Not recorded' }
    for (const [label, expected] of Object.entries(expectedFacts)) {
      assert.equal(facts[label], expected, `${title} has the wrong ${label.toLowerCase()} value`)
    }
    if (archiveNumber === 'JF-041') {
      assert.equal(await viewer.getByRole('heading', { name: 'Collection record', exact: true }).count(), 1, 'Jewellery must be identified as a collection record')
      assert.equal(facts['Photo credit'], 'Marie Girard', 'Jewellery lost the supplied Marie Girard photo credit')
      assert.equal(facts['Photographic images'], '21', 'Jewellery must label its collection photographs as images')
    } else {
      assert.equal(await viewer.getByRole('heading', { name: 'Work record', exact: true }).count(), 1, `${title} must remain a work record`)
      assert.equal(facts['Photographic views'], `${viewCount}`, `${title} must label its photographs as views`)
    }
    const notes = await viewer.locator('.viewer__record-notes > section').evaluateAll((sections) => Object.fromEntries(sections.map((section) => [section.querySelector('h3')?.textContent, section.querySelector('p')?.textContent])))
    assert.equal(notes["Artist's account"], 'Awaiting artist/family account.', `${title} invents an artist account`)
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

  await page.getByRole('button', { name: `Browse all ${currentArchiveCount} works` }).click()
  await page.locator('.archive-index[role="dialog"]').waitFor({ state: 'visible' })
  await assertNoOverflow(page, 'Current archive mobile')
  assert.equal(await page.locator('.archive-index__preview').count(), 0, 'The mobile archive should prioritize the searchable index')
  await page.getByRole('button', { name: 'Close archive' }).click()

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
  await exerciseHistoricalSpine()
  await exerciseArtworkRecord()
  await exerciseViewerHistory()
  await exerciseImageRecovery()
  await exerciseNewSculptures()
  await exerciseMobileSite()
  console.log('Final-site QA passed: Direction 5 mosaic, Archive 2001, Process, source-aware records, motion controls, and mobile.')
} finally {
  if (browser) await browser.close()
  if (localServer) {
    await new Promise((resolveClose, rejectClose) => {
      localServer.close((error) => error ? rejectClose(error) : resolveClose())
    })
  }
}
