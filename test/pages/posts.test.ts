import {describe, expect, it} from 'vitest'
import {createPage, setup, url} from '@nuxt/test-utils'
import {
  mockPostsPage0,
  mockPostsPage1,
  mockPostsPageWithOfflineMedia,
  mockPostsPageWithoutResults
} from './posts.mock-data'
import {defaultSetupConfig} from '../helper'

describe('/', async () => {
  await setup(defaultSetupConfig)

  it('sets mockdata correctly', async () => {
    // Make sure mockPostsPage0 and mockPostsPage1 have different first posts
    expect(mockPostsPage0.data[0].id).not.toBe(mockPostsPage1.data[0].id)
  })

  describe('Basic', async () => {
    it('renders page', async () => {
      // Arrange
      const page = await createPage('/posts')

      // Act
      const headerElement = page.getByRole('heading', { name: 'Posts', exact: true })

      // Assert
      await headerElement.isVisible()
    })

    it('renders a loader', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/posts?baseEndpoint=*',
        async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 5000))

          await route.fulfill({
            status: 200,
            json: mockPostsPage0
          })
        },
        { times: 1 }
      )

      // Act
      await page.goto(url('/posts/safebooru.org'))
      const loaderElement = page.getByTestId('posts-loader')

      // Assert
      await loaderElement.isVisible()
    })

    // TODO: Implement 204 response in API first
    it.skip('shows no results', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 204,
            json: mockPostsPageWithoutResults
          }),
        { times: 1 }
      )

      // Act
      await Promise.all([page.goto(url('/posts/safebooru.org')), page.waitForResponse('**/posts?baseEndpoint=*')])

      const titleElement = page.getByRole('heading', { name: /no results/i })

      // Assert
      await titleElement.isVisible()
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
      await Promise.all([page.goto(url('/posts/safebooru.org')), page.waitForResponse('**/posts?baseEndpoint=*')])

      const postsListElement = page.getByTestId('posts-list')

      const postsInList = postsListElement.locator('li')

      // Assert DOM
      // Expect 30 posts to be rendered + 4 ads
      expect(await postsInList.count()).toBe(34)

      // Post
      const firstPost = postsInList.first()

      // Image
      const firstPostImage = firstPost.locator('img')

      expect(await firstPostImage.getAttribute('src')).toBe(mockPostsPage0.data[0].low_res_file.url)

      await firstPost.getByRole('button', { name: /tags/i }).click()

      // Expect X tags to be rendered
      expect(
        //
        await firstPost.getByRole('listitem').count()
      ).toBe(mockPostsPage0.data[0].tags.general.length)
    })

    // TODO: Test that verifies if a post with 'unknown' media type is not rendered

    it.skip('proxies media when media failed to load', async () => {
      throw new Error('Not implemented')
    })

    it('renders warning when media failed to load', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/posts?baseEndpoint=*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPageWithOfflineMedia
          }),
        { times: 1 }
      )

      await page.route('**/example.local/**', (route) =>
        route.fulfill({
          status: 404
        })
      )

      // Act
      await Promise.all([
        page.goto(url('/posts/safebooru.org')),
        page.waitForResponse('**/posts?baseEndpoint=*'),

        await page.waitForRequest('**/example.local/**')
      ])

      // Assert

      // Expect 1 post
      expect(
        //
        await page.getByTestId('posts-list').locator('li').count()
      ).toBe(1)

      // Expect post to have warning
      expect(
        //
        await page.getByTestId('posts-list').locator('li').first().textContent()
      ).toContain('Error loading media')
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
      await Promise.all([page.goto(url('/posts/safebooru.org')), page.waitForResponse('**/posts?baseEndpoint=*')])

      // Scroll to bottom
      await Promise.all([
        page.getByTestId('load-next-page').scrollIntoViewIfNeeded(),

        page.waitForResponse('**/posts?baseEndpoint=*'),
        page.waitForURL('**/posts/safebooru.org&page=1')
      ])

      // Assert DOM
      // Expect 60 posts to be rendered + 8 ads
      expect(await page.getByTestId('posts-list').locator('li').count()).toBe(68)
    })

    it('sets H2 & loads tags from Post', async () => {
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

      const header2Element = page.getByRole('heading', { name: /tagged with/i })

      // Act
      await Promise.all([page.goto(url('/posts/safebooru.org')), page.waitForResponse('**/posts?baseEndpoint=*')])

      const postsListElement = page.getByTestId('posts-list')

      const firstPost = postsListElement.locator('li').first()

      // Click on a Post's tags
      await firstPost.getByRole('button', { name: /tags/i }).click()

      await Promise.all([
        // Click on a Post's tag button named "1girl"
        firstPost.getByRole('button', { name: /1girl/i }).click(),
        //
        page.waitForURL('**/posts/safebooru.org?tags=1girl'),
        page.waitForResponse('**/posts?baseEndpoint=*')
      ])

      // Assert

      // Expect header to contain "1girl"
      expect(await header2Element.textContent()).toContain('1girl')

      // Expect 30 posts to be rendered + 4 ads
      expect(await postsListElement.locator('li').count()).toBe(34)

      // Expect first post to have same id as mockPostsPage1
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('safebooru.org-' + mockPostsPage1.data[0].id.toString())
    })
  })

  describe('History', async () => {
    it('goes back & forward in history with correct scroll position', async () => {
      // Arrange
      const page = await createPage()

      // Order in reverse, so that mockPostsPage0 is the first page

      // TODO: This should NOT be necessary, data should be returned from cache
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
      await page.goto(url('/posts/safebooru.org'))

      const postsListElement = page.getByTestId('posts-list')

      // Scroll 200 px on initial page
      await page.mouse.wheel(0, 200)

      const firstPost = postsListElement.locator('li').first()

      // Expect first post to have same id as mockPostsPage0
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('safebooru.org-' + mockPostsPage0.data[0].id.toString())

      // Click on a Post's tag
      await firstPost.getByRole('button', { name: /tags/i }).click()

      // Click on a Post's tag button named "1girl"
      // And go to next page
      await Promise.all([
        firstPost.getByRole('button', { name: /1girl/i }).click(),

        page.waitForURL('**/posts/safebooru.org?tags=1girl'),
        page.waitForResponse('**/posts?baseEndpoint=*')
      ])

      // Scroll 400 px
      await page.mouse.wheel(0, 400)

      // Expect first post to have same id as mockPostsPage1
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('safebooru.org-' + mockPostsPage1.data[0].id.toString())

      // === Go back === //
      await Promise.all([page.goBack(), page.waitForURL('**/posts/safebooru.org')])

      // Expect first post to have same testId as mockPostsPage0
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('safebooru.org-' + mockPostsPage0.data[0].id.toString())

      // Expect scroll to be at 200 px
      expect(
        //
        await page.evaluate(() => window.scrollY)
      ).toBe(200)

      // === Go forward === //
      await Promise.all([page.goForward(), page.waitForURL('**/posts/safebooru.org?tags=1girl')])

      // Expect first post to have same testId as mockPostsPage1
      expect(
        //
        await firstPost.getAttribute('data-testid')
      ).toBe('safebooru.org-' + mockPostsPage1.data[0].id.toString())

      // Expect scroll to be at 400 px
      expect(
        //
        await page.evaluate(() => window.scrollY)
      ).toBe(400)
    }, 15000)
  })

  describe('Domain', async () => {
    it('defaults domain to rule34.xxx', async () => {
      // Arrange
      const page = await createPage()

      // Act
      await page.goto(url('/posts'))

      // Expect domain to be rule34.xxx
      const domainSelectorText = await page.getByTestId('domain-selector').getByRole('button').textContent()

      // Extract domain from button text "...: rule34.xxx"
      expect(domainSelectorText?.split(':')[1].trim()).toBe('rule34.xxx')
    })

    it('changes domain', async () => {
      // Arrange
      const page = await createPage()

      // Act
      await page.goto(url('/posts'))

      await page.getByTestId('domain-selector').getByRole('button').click()

      await Promise.all([
        page.getByRole('option', { name: /safebooru/i }).click(),

        page.waitForURL('**/posts/safebooru.org')
      ])

      // Assert
      // Expect domain to be safebooru.org
      const domainSelectorText = await page.getByTestId('domain-selector').getByRole('button').textContent()

      // Extract domain from button text "...: safebooru.org"
      expect(domainSelectorText?.split(':')[1].trim()).toBe('safebooru.org')
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
})
