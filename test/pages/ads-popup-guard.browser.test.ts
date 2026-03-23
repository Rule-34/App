import { createPage, setup, url } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import type { Page } from 'playwright-core'
import { defaultBrowserOptions } from '../helper'

const AD_LAST_POPUP_AT_STORAGE_KEY = 'ads-last-popup-at'
const AD_POPUP_CAP_DURATION_MS = 20 * 60 * 1000
const FORCED_AD_RANDOM_VALUE = 0.9
const INTERCEPTED_POPUNDER_URL = 'https://intercepted-ad.test/popunder'
const INTERCEPTED_FALLBACK_URL = 'https://intercepted-ad.test/fallback'

const INTERCEPTED_DYNAMIC_POPUNDER_SCRIPT = `
(() => {
  if (window.__dynamicPopupAdInstalled) {
    return
  }

  window.__dynamicPopupAdInstalled = true

  document.addEventListener('click', () => {
    const popup = window.open('${INTERCEPTED_POPUNDER_URL}', '_blank')

    if (!popup) {
      window.location.href = '${INTERCEPTED_FALLBACK_URL}'
    }
  }, true)
})()
`

type RequestCounts = {
  popunderWrapper: number
  popunderRemote: number
  pushRemote: number
  dynamicPopunderRemote: number
  unexpectedPopunderRemote: number
  remoteDocuments: number
}

async function waitFor(predicate: () => boolean, timeoutMs = 10_000) {
  const startedAt = Date.now()

  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error('Timed out waiting for expected browser-side condition')
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

async function installRealAdRoutes(page: Page, appOrigin: string): Promise<RequestCounts> {
  const requestCounts: RequestCounts = {
    popunderWrapper: 0,
    popunderRemote: 0,
    pushRemote: 0,
    dynamicPopunderRemote: 0,
    unexpectedPopunderRemote: 0,
    remoteDocuments: 0
  }

  await page.context().route('**/*', async (route) => {
    const request = route.request()
    const requestUrl = new URL(request.url())
    const isLocalDocument = request.resourceType() === 'document' && requestUrl.origin === appOrigin
    const isLocalOrigin = requestUrl.origin === appOrigin

    if (request.resourceType() === 'document' && !isLocalDocument) {
      requestCounts.remoteDocuments += 1

      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><title>Intercepted popup</title><body>popup</body>'
      })

      return
    }

    if (request.resourceType() === 'script' && !isLocalOrigin) {
      requestCounts.dynamicPopunderRemote += 1

      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: INTERCEPTED_DYNAMIC_POPUNDER_SCRIPT
      })

      return
    }

    await route.continue()
  })

  await page.route('**/js/popunder2.js*', async (route) => {
    requestCounts.popunderWrapper += 1
    await route.continue()
  })

  await page.route('**bundlemoviepumice.com/on.js', async (route) => {
    requestCounts.popunderRemote += 1

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.__bundlemoviepumiceLoaded = true;'
    })
  })

  await page.route('**ellipticaltrack.com/**', async (route) => {
    requestCounts.unexpectedPopunderRemote += 1

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: ''
    })
  })

  await page.route('**udzpel.com/**', async (route) => {
    requestCounts.pushRemote += 1

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.__pushVendorLoaded = true;'
    })
  })

  await page.route('**hotbsizovu.today/**', async (route) => {
    requestCounts.pushRemote += 1

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.__pushVendorLoaded = true;'
    })
  })

  await page.route('**hotsoz.com/**', async (route) => {
    requestCounts.pushRemote += 1

    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Intercepted push popup</title><body>push</body>'
    })
  })

  return requestCounts
}

async function preparePage() {
  const page = await createPage('/')
  const appOrigin = new URL(page.url()).origin
  const requestCounts = await installRealAdRoutes(page, appOrigin)

  await page.addInitScript(({ forcedRandomValue }) => {
    Math.random = () => forcedRandomValue
  }, {
    forcedRandomValue: FORCED_AD_RANDOM_VALUE
  })

  await page.evaluate((storageKey) => {
    window.localStorage.removeItem(storageKey)
  }, AD_LAST_POPUP_AT_STORAGE_KEY)

  await page.reload()
  await page.waitForSelector('h1')

  return {
    page,
    appOrigin,
    requestCounts
  }
}

async function armAdvertisements(page: Page, requestCounts: RequestCounts, expectScriptInstall = true) {
  await page.locator('h1').click()

  if (expectScriptInstall) {
    await waitFor(() => {
      return requestCounts.popunderWrapper > 0
        && requestCounts.popunderRemote > 0
        && requestCounts.dynamicPopunderRemote > 0
    })
  }
}

describe('popup guard browser flow', async () => {
  await setup({
    browser: true,
    browserOptions: defaultBrowserOptions
  })

  it('uses the real popunder wrapper, blocks capped repeats, skips reinjection while capped, and allows again after expiry', async () => {
    const { page, appOrigin, requestCounts } = await preparePage()

    await armAdvertisements(page, requestCounts)

    expect(requestCounts.popunderWrapper).toBeGreaterThan(0)
    expect(requestCounts.popunderRemote).toBeGreaterThan(0)
    expect(requestCounts.dynamicPopunderRemote).toBeGreaterThan(0)
    expect(requestCounts.unexpectedPopunderRemote).toBe(0)

    const firstPopupPromise = page.waitForEvent('popup')

    await page.locator('h1').click()

    const firstPopup = await firstPopupPromise
    await firstPopup.close()

    expect(await page.evaluate((storageKey) => {
      return window.localStorage.getItem(storageKey)
    }, AD_LAST_POPUP_AT_STORAGE_KEY)).toMatch(/^\d+$/)
    expect(new URL(page.url()).origin).toBe(appOrigin)

    const popunderWrapperBeforeBlockedClick = requestCounts.popunderWrapper
    const popunderRemoteBeforeBlockedClick = requestCounts.popunderRemote
    const dynamicPopunderRemoteBeforeBlockedClick = requestCounts.dynamicPopunderRemote
    const remoteDocumentsBeforeBlockedClick = requestCounts.remoteDocuments
    const blockedPopupPromise = page.waitForEvent('popup', { timeout: 1_000 }).catch(() => null)
    const blockedErrorPromise = page.waitForEvent('pageerror', { timeout: 1_000 }).catch(() => null)

    await page.locator('h1').click()

    const [blockedPopup, blockedError] = await Promise.all([blockedPopupPromise, blockedErrorPromise])

    expect(blockedPopup === null).toBe(true)
    expect(blockedError?.message).toContain('Ad popup blocked: frequency-cap')
    expect(new URL(page.url()).origin).toBe(appOrigin)
    expect(requestCounts.popunderWrapper).toBe(popunderWrapperBeforeBlockedClick)
    expect(requestCounts.popunderRemote).toBe(popunderRemoteBeforeBlockedClick)
    expect(requestCounts.dynamicPopunderRemote).toBe(dynamicPopunderRemoteBeforeBlockedClick)
    expect(requestCounts.remoteDocuments).toBe(remoteDocumentsBeforeBlockedClick)

    await page.reload()
    await page.waitForSelector('h1')

    const reloadRemoteDocumentsBeforeBlockedClick = requestCounts.remoteDocuments
    const reloadBlockedPopupPromise = page.waitForEvent('popup', { timeout: 1_000 }).catch(() => null)

    await page.locator('h1').click()

    const reloadBlockedPopup = await reloadBlockedPopupPromise

    expect(reloadBlockedPopup === null).toBe(true)
    expect(new URL(page.url()).origin).toBe(appOrigin)
    expect(requestCounts.remoteDocuments).toBe(reloadRemoteDocumentsBeforeBlockedClick)

    await page.evaluate(({ storageKey, expiredAt }) => {
      window.localStorage.setItem(storageKey, String(expiredAt))
    }, {
      storageKey: AD_LAST_POPUP_AT_STORAGE_KEY,
      expiredAt: Date.now() - AD_POPUP_CAP_DURATION_MS - 60_000
    })

    await page.reload()
    await page.waitForSelector('h1')

    const popunderWrapperRequestsBeforeExpiredInteraction = requestCounts.popunderWrapper
    const popunderRemoteRequestsBeforeExpiredInteraction = requestCounts.popunderRemote

    await page.locator('h1').click()
    await page.locator('h1').click()

    expect(requestCounts.popunderWrapper).toBeGreaterThan(popunderWrapperRequestsBeforeExpiredInteraction)
    expect(requestCounts.popunderRemote).toBeGreaterThan(popunderRemoteRequestsBeforeExpiredInteraction)

    const expiredPopupPromise = page.waitForEvent('popup')

    await page.locator('h1').click()

    const expiredPopup = await expiredPopupPromise
    await expiredPopup.close()

    expect(new URL(page.url()).origin).toBe(appOrigin)
    expect(page.url()).not.toContain(INTERCEPTED_FALLBACK_URL)
  }, 60_000)
})
