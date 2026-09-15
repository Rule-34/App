import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { project } from '../../config/project'
import { useTrackedPageFactory } from '../helper'

describe('/', async () => {
  await setup({
    browser: true
  })

  const createTrackedPage = useTrackedPageFactory()

  it('renders', async () => {
    const page = await createTrackedPage('/')

    await page.locator('h1', { hasText: 'App' }).isVisible()
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

  it('links the footer to the site, the legal pages and the social profiles', async () => {
    const page = await createTrackedPage('/')

    const footer = page.getByTestId('home-footer')
    await footer.waitFor({ state: 'visible' })

    const hrefs = await footer
      .locator('a')
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')))

    // Every sidebar link except `settings` (install-app, faq and blog are external), then the legal
    // pages and the social profiles. Listed explicitly so a dropped link fails this test.
    expect(hrefs).toEqual([
      '/',
      '/other-sites',
      `https://www.installpwa.com/from/${project.urls.production.hostname}`,
      'https://rule34.app/frequently-asked-questions',
      `${project.urls.production.toString()}blog`,
      '/legal',
      '/privacy-policy',
      '/terms-of-service',
      '/cookie-policy',
      '/dmca',
      project.social.twitter,
      project.social.discord,
      project.social.github
    ])

    // `settings` needs the current app state, so it stays in the sidebar only
    expect(hrefs).not.toContain('/settings')
  }, 30000)
})
