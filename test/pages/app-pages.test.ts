import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils'
import { chromium } from 'playwright'
import { MATOMO_AB_STORAGE_KEY, PREMIUM_LANDING_EXPERIMENT_NAME } from '../../app/assets/js/matomo'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

describe('App pages', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  describe('Home page /', () => {
    it('renders', async () => {
      const page = await createTrackedPage('/')

      const heading = page.locator('h1', { hasText: 'App' })
      await heading.waitFor({ state: 'visible' })
      expect(await heading.isVisible()).toBe(true)
    }, 30000)

    it('redirects to /posts with query params', async () => {
      // Arrange
      const page = await createTrackedPage('/?domain=safebooru.org&page=3&tags=cat|black_hair')

      // Act
      await page.waitForSelector('h1')

      // Assert
      const currentUrl = new URL(page.url())

      expect(currentUrl.pathname).toBe('/posts/safebooru.org')
      expect(currentUrl.searchParams.get('domain')).toBe(null)
      expect(currentUrl.searchParams.get('page')).toBe('3')
      expect(currentUrl.searchParams.get('tags')).toBe('cat|black_hair')
    }, 30000)

    it('links featured tags directly to post results', async () => {
      const page = await createTrackedPage('/')

      const animatedLink = page.locator('a:has(img[alt="Featured tag: Animated (video)"])').first()
      await animatedLink.waitFor({ state: 'visible' })

      const href = await animatedLink.getAttribute('href')
      expect(href).toContain('/posts/rule34.xxx?tags=animated')
      expect(href).not.toContain('/posts/rule34.xxx/animated')
    }, 30000)
  })

  describe('Settings page /settings', () => {
    it('renders', async () => {
      const page = await createTrackedPage('/settings')

      await page.waitForSelector('h1')

      expect(await page.textContent('h1')).toBe('Settings')
    })

    it('shows the first lazy toast after rendering the toaster', async () => {
      const page = await createTrackedPage('/settings')

      await page.getByRole('button', { name: /Tag block list None/ }).click()
      await page.getByRole('option', { name: 'Custom' }).click()

      await page
        .getByText('You need to be a Premium member to use the custom blocklist')
        .waitFor({ state: 'visible', timeout: 5000 })
    }, 15000)
  })

  describe('Premium landing /premium', () => {
    it('renders the prerendered landing without hiding it', async () => {
      const html = await fetch(url('/premium')).then((response) => response.text())

      expect(html).toContain('Browse Ad-free &amp; Save Posts')
      expect(html).toContain('Premium Plans')
      expect(html).not.toContain('data-premium-ab="pending"')
      expect(html).not.toContain('premium-visual-hero')
    })

    it('shows the hero and pricing with JavaScript disabled', async () => {
      const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
      const context = await browser.newContext({ javaScriptEnabled: false })
      const page = await context.newPage()

      try {
        await page.goto(url('/premium'))

        expect(await page.locator('body').innerText()).toContain('Browse Ad-free & Save Posts')
        expect(await page.locator('body').innerText()).toContain('Premium Plans')
      } finally {
        await browser.close()
      }
    }, 30000)

    it('shows the landing in under a second when Matomo is blocked', async () => {
      const page = await createTrackedPage()
      await page.route('**/matomo.js', (route) => route.abort())

      const started = Date.now()
      await page.goto(url('/premium'), { waitUntil: 'commit' })
      await page
        .getByRole('heading', { name: 'Browse Ad-free & Save Posts' })
        .waitFor({ state: 'visible', timeout: 1000 })

      expect(Date.now() - started).toBeLessThan(1000)
    }, 30000)

    it('shows the landing before a 10s Matomo delay reaches the assignment timeout', async () => {
      const page = await createTrackedPage()
      await page.route('**/matomo.js', () => new Promise(() => {}))

      const started = Date.now()
      await page.goto(url('/premium'), { waitUntil: 'commit' })
      await page
        .getByRole('heading', { name: 'Browse Ad-free & Save Posts' })
        .waitFor({ state: 'visible', timeout: 5000 })

      expect(Date.now() - started).toBeLessThan(5000)
      await page.close()
    }, 30000)

    it('forces each variation with pk_ab_test', async () => {
      const original = await createTrackedPage('/premium?pk_ab_test=original')
      await original.getByRole('heading', { name: 'Browse Ad-free & Save Posts' }).waitFor({ state: 'visible' })
      expect(await original.getByTestId('premium-visual-hero').count()).toBe(0)

      const offer = await createTrackedPage('/premium?pk_ab_test=OfferFirst')
      await offer.waitForFunction(
        () => document.querySelector('h1')?.className.includes('text-pretty') === true,
        null,
        {
          timeout: 2000
        }
      )
      await offer.getByRole('heading', { name: 'Premium Plans' }).waitFor({ state: 'visible' })
      expect(await offer.getByTestId('premium-visual-hero').count()).toBe(0)

      const visual = await createTrackedPage('/premium?pk_ab_test=VisualFirst')
      await visual.getByTestId('premium-visual-hero').waitFor({ state: 'visible' })
      expect(await visual.locator('h1').getAttribute('class')).toContain('text-pretty')
      await visual.getByRole('heading', { name: 'Premium Plans' }).waitFor({ state: 'visible' })
      await visual.locator('[data-premium-landing] img').first().waitFor({ state: 'visible' })
    }, 30000)

    it('applies the cached arm on client navigation to /premium', async () => {
      const page = await createPage()
      await page.addInitScript(
        ({ storageKey, experiment }) => {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              [`variation:${experiment}`]: { value: 'OfferFirst', expire: Date.now() + 86_400_000 }
            })
          )
        },
        { storageKey: MATOMO_AB_STORAGE_KEY, experiment: PREMIUM_LANDING_EXPERIMENT_NAME }
      )
      await page.goto(url('/other-sites'))
      await page.getByRole('heading', { name: 'Other sites' }).waitFor({ state: 'visible', timeout: 10000 })
      await page.waitForFunction(
        () => (document.querySelector('#__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__
      )
      await page.evaluate(() => {
        ;(window as unknown as { __spa?: boolean }).__spa = true
      })
      await page.getByRole('button', { name: 'Open main menu' }).click({ timeout: 5000 })
      await page.getByRole('link', { name: 'Premium', exact: true }).click({ timeout: 5000 })
      await page.waitForURL('**/premium', { timeout: 5000 })
      expect(await page.evaluate(() => (window as unknown as { __spa?: boolean }).__spa)).toBe(true)
      await page.waitForFunction(() => document.querySelector('h1')?.className.includes('text-pretty') === true, null, {
        timeout: 2000
      })
      expect(await page.getByTestId('premium-visual-hero').count()).toBe(0)
      await page.close()
    }, 20000)

    it('shows a cached variation on /premium when the URL does not force one', async () => {
      const page = await createPage()
      await page.addInitScript(
        ({ storageKey, experiment }) => {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              [`variation:${experiment}`]: { value: 'VisualFirst', expire: Date.now() + 86_400_000 }
            })
          )
        },
        { storageKey: MATOMO_AB_STORAGE_KEY, experiment: PREMIUM_LANDING_EXPERIMENT_NAME }
      )
      await page.goto(url('/premium'))
      await page.getByTestId('premium-visual-hero').waitFor({ state: 'visible', timeout: 2000 })
      expect(page.url()).not.toContain('pk_ab_test')
      await page.close()
    }, 20000)
  })

  describe('Other sites page /other-sites', () => {
    it('renders', async () => {
      const page = await createTrackedPage('/other-sites')

      await page.waitForSelector('h1')

      expect(await page.textContent('h1')).toBe('Other sites')
    })
  })
})
