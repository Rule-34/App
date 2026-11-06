import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
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
    it('keeps the prerendered landing hidden until a variation is assigned', async () => {
      const html = await fetch(url('/premium')).then((response) => response.text())

      expect(html).toContain('data-premium-ab="pending"')
      expect(html).toContain('data-premium-landing')
      expect(html).not.toContain('premium-visual-hero')
    })

    it('forces each variation with pk_ab_test', async () => {
      const original = await createTrackedPage('/premium?pk_ab_test=original')
      await original.getByRole('heading', { name: 'Browse Ad-free & Save Posts' }).waitFor({ state: 'visible' })
      expect(await original.getByTestId('premium-visual-hero').count()).toBe(0)
      expect(await original.locator('html').getAttribute('data-premium-ab')).toBeNull()

      const offer = await createTrackedPage('/premium?pk_ab_test=OfferFirst')
      await offer.locator('h1').waitFor({ state: 'visible' })
      expect(await offer.locator('h1').getAttribute('class')).toContain('text-pretty')
      await offer.getByRole('heading', { name: 'Premium Plans' }).waitFor({ state: 'visible' })
      expect(await offer.getByTestId('premium-visual-hero').count()).toBe(0)

      const visual = await createTrackedPage('/premium?pk_ab_test=VisualFirst')
      await visual.getByTestId('premium-visual-hero').waitFor({ state: 'visible' })
      expect(await visual.locator('h1').getAttribute('class')).toContain('text-pretty')
      await visual.getByRole('heading', { name: 'Premium Plans' }).waitFor({ state: 'visible' })
      await visual.locator('[data-premium-landing] img').first().waitFor({ state: 'visible' })
    }, 30000)
  })

  describe('Other sites page /other-sites', () => {
    it('renders', async () => {
      const page = await createTrackedPage('/other-sites')

      await page.waitForSelector('h1')

      expect(await page.textContent('h1')).toBe('Other sites')
    })
  })
})
