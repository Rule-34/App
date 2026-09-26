import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

describe('App pages', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  describe('Home page /', () => {
    it('renders', async () => {
      const page = await createTrackedPage('/')

      expect(await page.locator('h1', { hasText: 'App' }).isVisible()).toBe(true)
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

  describe('Other sites page /other-sites', () => {
    it('renders', async () => {
      const page = await createTrackedPage('/other-sites')

      await page.waitForSelector('h1')

      expect(await page.textContent('h1')).toBe('Other sites')
    })
  })
})
