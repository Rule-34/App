import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { useTrackedPageFactory } from '../helper'

describe('/', async () => {
  await setup({
    browser: true
  })

  const createTrackedPage = useTrackedPageFactory()

  it('renders', async () => {
    const page = await createTrackedPage('/')

    await page.locator('h1', { hasText: 'App' }).isVisible()
  })

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
  })

  it('links featured tags directly to post results', async () => {
    const page = await createTrackedPage('/')

    const animatedLink = page.locator('a:has(img[alt="Featured tag: Animated (video)"])').first()
    await animatedLink.waitFor({ state: 'visible' })

    const href = await animatedLink.getAttribute('href')
    expect(href).toContain('/posts/rule34.xxx?tags=animated')
    expect(href).not.toContain('/posts/rule34.xxx/animated')
  })
})
