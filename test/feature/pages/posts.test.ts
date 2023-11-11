import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils'
import { mockPostsPage0, mockPostsPage1, mockPostsPageHalf1And2 } from './posts.mock-data'

describe('/', async () => {
  await setup({
    browser: true,
    browserOptions: {
      type: 'chromium',
      launch: {
        // headless: false,
        // slowMo: 1000
        // devtools: true
      }
    }
  })

  describe('Basic', async () => {
    it('renders page', async () => {
      // Arrange
      const page = await createPage('/posts')

      // Assert DOM
      expect(await page.locator('h1').innerText()).toBe('Posts')
    })

    it('renders a loader', async () => {
      throw new Error('Not implemented')
    })

    it('shows no results', async () => {
      throw new Error('Not implemented')
    })
  })

  describe('Posts', async () => {
    it('renders posts', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPage0
          }),
        { times: 1 }
      )

      // Act
      await Promise.all([
        page.goto(url('/posts?domain=safebooru.org')),
        page.waitForResponse('**/posts?baseEndpoint=*')
      ])

      const postsListElement = page.getByTestId('posts-list')

      const postsInList = await postsListElement.locator('li')

      // Assert DOM
      // Expect 30 posts to be rendered + 4 ads
      expect(await postsInList.count()).toBe(34)

      // Post
      const firstPost = postsInList.first()

      // Image
      const firstPostImage = await firstPost.locator('img')

      expect(await firstPostImage.getAttribute('src')).toBe(mockPostsPage0.data[0].low_res_file.url)

      await firstPost.getByRole('button', { name: /tags/i }).click()

      // Expect X tags to be rendered
      expect(
        //
        await firstPost.getByRole('listitem').count()
      ).toBe(mockPostsPage0.data[0].tags.general.length)
    })

    it('renders warning when unknown media is loaded', async () => {
      throw new Error('Not implemented')
    })

    it('proxies media when media failed to load', async () => {
      throw new Error('Not implemented')

    })

    it('renders warning when media failed to load', async () => {
      throw new Error('Not implemented')
    })
  })

  describe('Pagination', async () => {
    it('loads more posts', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPage0
          }),
        { times: 1 }
      )

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPage1
          }),
        { times: 1 }
      )

      // Act
      await Promise.all([
        page.goto(url('/posts?domain=safebooru.org')),
        page.waitForResponse('**/posts?baseEndpoint=*')
      ])

      // Scroll to bottom
      await page.getByTestId('load-next-page').scrollIntoViewIfNeeded()

      await Promise.all([
        page.waitForResponse('**/posts?baseEndpoint=*'),
        page.waitForURL('**/posts?domain=safebooru.org&page=1')
      ])

      // Assert DOM
      // Expect 60 posts to be rendered + 8 ads
      expect(await page.getByTestId('posts-list').locator('li').count()).toBe(68)
    })

    it('de-duplicates posts', async () => {
      // Arrange
      const page = await createPage()

      // Order in reverse, so that mockPostsPage0 is the first page
      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPageHalf1And2
          }),
        { times: 1 }
      )

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPage0
          }),
        { times: 1 }
      )

      // Make sure mockPostsPage0 and mockPostsPageHalf1And2 first posts are the same
      expect(mockPostsPage0.data[0].id).toBe(mockPostsPageHalf1And2.data[0].id)

      // Make sure mockPostsPage0 and mockPostsPageHalf1And2 last posts are NOT the same
      expect(mockPostsPage0.data[29].id).not.toBe(mockPostsPageHalf1And2.data[29].id)

      // Act
      await page.goto(url('/posts?domain=safebooru.org'))

      const postsListElement = page.getByTestId('posts-list')

      await page.getByTestId('load-next-page').scrollIntoViewIfNeeded()

      await page.waitForResponse('**/posts?baseEndpoint=*')

      // Expect 45 posts to be rendered + 6 ads
      expect(await postsListElement.locator('li').count()).toBe(51)
    })

    it('loads tags from Post', async () => {
      // Arrange
      const page = await createPage()

      // Order in reverse, so that mockPostsPage0 is the first page
      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPage1
          }),
        { times: 1 }
      )

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPage0
          }),
        { times: 1 }
      )

      // Make sure mockPostsPage0 and mockPostsPage1 have different first posts
      expect(mockPostsPage0.data[0].id).not.toBe(mockPostsPage1.data[0].id)

      // Act
      await page.goto(url('/posts?domain=safebooru.org'))

      const postsListElement = page.getByTestId('posts-list')

      const firstPost = postsListElement.locator('li').first()

      // Expect first post to have same id as mockPostsPage0
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('post-safebooru.org-' + mockPostsPage0.data[0].id.toString())

      // Click on a Post's tag
      await firstPost.getByRole('button', { name: /tags/i }).click()

      // Click on a Post's tag button named "1girl"
      await firstPost.getByRole('button', { name: /1girl/i }).click()

      await Promise.all([
        page.waitForURL('**/posts?domain=safebooru.org&tags=1girl')
        // page.waitForResponse('**/posts?baseEndpoint=*')
      ])

      // Expect first post to have same id as mockPostsPage1
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('post-safebooru.org-' + mockPostsPage1.data[0].id.toString())

      // TODO: Expect tag to be rendered & selected
    })
  })

  describe('History', async () => {
    it(
      'goes back in history, and restores data',
      async () => {
        // Arrange
        const page = await createPage()

        // Order in reverse, so that mockPostsPage0 is the first page
        await page.route(
          '**/posts?baseEndpoint=*',
          (route) =>
            route.fulfill({
              status: 200,
              json: mockPostsPage1
            }),
          { times: 1 }
        )

        await page.route(
          '**/posts?baseEndpoint=*',
          (route) =>
            route.fulfill({
              status: 200,
              json: mockPostsPage0
            }),
          { times: 1 }
        )

        // Make sure mockPostsPage0 and mockPostsPage1 have different first posts
        expect(mockPostsPage0.data[0].id).not.toBe(mockPostsPage1.data[0].id)

        // Act
        await page.goto(url('/posts?domain=safebooru.org'))

        const postsListElement = page.getByTestId('posts-list')

        // Scroll 200 px
        await page.mouse.wheel(0, 200)

        const firstPost = postsListElement.locator('li').first()

        // Expect first post to have same id as mockPostsPage0
        expect(
          //
          await firstPost.getAttribute('data-testid')
        ).toBe('post-safebooru.org-' + mockPostsPage0.data[0].id.toString())

        // Click on a Post's tag
        await firstPost.getByRole('button', { name: /tags/i }).click()

        // Click on a Post's tag button named "1girl"
        await firstPost.getByRole('button', { name: /1girl/i }).click()

        await page.waitForResponse('**/posts?baseEndpoint=*')

        // Scroll 400 px
        await page.mouse.wheel(0, 400)

        // Expect first post to have same id as mockPostsPage1
        expect(
          //
          await firstPost.getAttribute('data-testid')
        ).toBe('post-safebooru.org-' + mockPostsPage1.data[0].id.toString())

        // Go back
        const backNavigation = await page.goBack()

        expect(backNavigation).not.toBeNull()

        // TODO: TIMEOUT EXCEPTION HERE
        // Expect posts to be from mockPostsPage0

        // Expect first post to have same testId as mockPostsPage0
        expect(
          //
          await firstPost.getAttribute('data-testid')
        ).toBe('post-safebooru.org-' + mockPostsPage0.data[0].id.toString())

        // Expect no network requests
        try {
          await page.waitForResponse('**/posts?baseEndpoint=*', { timeout: 1000 })

          throw new Error('Unexpected network request')
        } catch (e) {
          expect(e.message).toContain('Timeout')
        }

        // Expect scroll to be at 200 px
        expect(
          //
          await page.evaluate(() => window.scrollY)
        ).toBe(200)
      },
      { timeout: 15000 }
    )

    it('goes forward in history, and restores data', async () => {
      throw new Error('Not implemented')
    })
  })

  describe('Domain', async () => {
    it('defaults domain to rule34.xxx', async () => {
      // Arrange
      const page = await createPage()

      // Act
      await page.goto(url('/posts'))

      // Expect domain to be rule34.xxx
      const domainSelectorText = await page.getByTestId('domain-selector').getByRole('button').textContent()

      if (!domainSelectorText) {
        throw new Error('domainSelectorText is null')
      }

      // Extract domain from button text "...: rule34.xxx"
      expect(domainSelectorText.split(':')[1].trim()).toBe('rule34.xxx')
    })

    it('changes domain', async () => {
      // Arrange
      const page = await createPage()

      // Act
      await page.goto(url('/posts'))

      await page.getByTestId('domain-selector').getByRole('button').click()

      await page
        .getByTestId('domain-selector')
        .click()

      await page
        .getByRole('option', { name: /safebooru/i })
        .click()

      await Promise.all([
        page.waitForURL('**/posts?domain=safebooru.org')
        // page.waitForResponse('**/posts?baseEndpoint=*')
      ])

      // Assert
      // Expect domain to be safebooru.org
      const domainSelectorText = await page.getByTestId('domain-selector').getByRole('button').textContent()

      if (!domainSelectorText) {
        throw new Error('domainSelectorText is null')
      }

      // Extract domain from button text "...: safebooru.org"
      expect(domainSelectorText.split(':')[1].trim()).toBe('safebooru.org')
    })
  })

  describe('Search', async () => {
    it('autocompletes tags', async () => {
      throw new Error('Not implemented')
    })

    it('loads a tag page', async () => {
      throw new Error('Not implemented')
    })
  })

  describe('Restore last session', async () => {
    it('renders', async () => {
      throw new Error('Not implemented')
      // TODO: Visit a tag page
      // TODO: Visit default page with full reload
      // TODO: Check modal is rendered
    })

    it('restores last session', async () => {
      throw new Error('Not implemented')
    })
  })
})
