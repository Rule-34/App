import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('/', async () => {
  await setup({
    browser: true
  })

  it('renders', async () => {
    const page = await createPage('/')

    await page.locator('h1', { hasText: 'App' }).isVisible()
  })

  it('redirects to /posts with query params', async () => {
    // Arrange
    const page = await createPage('/?domain=safebooru.org&page=3&tags=cat|black_hair')

    // Act
    await page.waitForSelector('h1')

    // Assert
    const currentUrl = new URL(page.url())

    expect(currentUrl.pathname).toBe('/posts/safebooru.org')
    expect(currentUrl.searchParams.get('page')).toBe('3')
    expect(currentUrl.searchParams.get('tags')).toBe('cat|black_hair')
  })
})
