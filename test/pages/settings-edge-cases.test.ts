import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { mockPostsPage0, mockPostsPage1 } from './posts.mock-data'
import {
  collectConsoleProblems,
  collectPostsRequests,
  defaultSetupConfig,
  pushRoute,
  readNuxtError,
  seedLocalStorage,
  type TrackedPage,
  useTrackedPageFactory
} from '../helper'

/**
 * Settings live in `localStorage`, so the server always renders the defaults. These tests cold-load pages as a returning
 * visitor with unusual settings and check that hydration copes with the difference.
 */

const firstPostId = mockPostsPage0.data[0].id
const secondPostId = mockPostsPage0.data[1].id
const nextPageFirstPostId = mockPostsPage1.data[0].id

/** Scrolls to the end of the virtualized list until it renders a row at or past `index`. */
async function scrollToRow(page: TrackedPage, index: number) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight)
          return Math.max(
            -1,
            ...[...document.querySelectorAll('li[data-index]')].map((li) => Number(li.getAttribute('data-index')))
          )
        }),
      { timeout: 20000 }
    )
    .toBeGreaterThanOrEqual(index)
}

/** The first row of the next page, once every post of the first page is shown. */
const nextPageRow = mockPostsPage0.data.length

describe('Settings edge cases', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  async function coldLoad(path: string, storage: Record<string, string>) {
    const page = await createTrackedPage()
    const problems = collectConsoleProblems(page)
    const requests = collectPostsRequests(page)

    await seedLocalStorage(page, storage)
    await page.goto(url(path), { waitUntil: 'networkidle' })

    return { page, problems, requests }
  }

  describe('posts per page', () => {
    it.each(['7', '100', '0', '-5', 'abc', '100000', ''])(
      'cold-loads posts and the next page with a stored value of "%s"',
      async (value) => {
        const { page, problems, requests } = await coldLoad('/posts/safebooru.org', { 'settings-postsPerPage': value })

        await page.getByTestId(`safebooru.org-${firstPostId}`).first().waitFor({ state: 'visible' })
        await scrollToRow(page, nextPageRow)

        for (const params of requests) {
          const limit = Number(params.get('limit'))
          expect(Number.isInteger(limit) && limit >= 1 && limit <= 100, `limit=${params.get('limit')}`).toBe(true)
        }

        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )
  })

  describe('block list', () => {
    it.each([
      ['the AI block list', { 'settings-blockAiGeneratedImages': 'true' }],
      [
        'the default list with the AI block list',
        { 'user-selectedList': 'default', 'settings-blockAiGeneratedImages': 'true' }
      ]
    ])(
      'hides a blocked first post that the server rendered (%s)',
      async (_, storage) => {
        const { page, problems } = await coldLoad('/posts/safebooru.org?tags=ai_first_post_test', storage)

        await page.getByTestId(`safebooru.org-${secondPostId}`).first().waitFor({ state: 'visible' })

        expect(await page.getByTestId(`safebooru.org-${firstPostId}`).count()).toBe(0)
        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )

    it('moves on to the next page when the block list hides the whole first page', async () => {
      const { page, problems } = await coldLoad('/posts/safebooru.org?tags=ai_whole_page_test', {
        'settings-blockAiGeneratedImages': 'true'
      })

      await page.getByTestId(`safebooru.org-${nextPageFirstPostId}`).first().waitFor({ state: 'visible' })

      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)

    it('explains that a searched tag is blocked on a cold load', async () => {
      const { page, problems } = await coldLoad('/posts/safebooru.org?tags=ai_generated', {
        'settings-blockAiGeneratedImages': 'true'
      })

      await page.getByText('One of your selected tags is in the block list').first().waitFor({ state: 'visible' })

      expect(await page.getByTestId(`safebooru.org-${firstPostId}`).count()).toBe(0)
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)

    it.each(['garbage', '"default"', ''])(
      'ignores a stored block list choice of %j',
      async (value) => {
        const { page, problems } = await coldLoad('/posts/safebooru.org', { 'user-selectedList': value })

        await page.getByTestId(`safebooru.org-${firstPostId}`).first().waitFor({ state: 'visible' })

        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )
  })

  describe('media', () => {
    it.each([
      ['full size images', { 'settings-postFullSizeImages': 'true' }],
      ['autoplay', { 'settings-autoplayAnimatedMedia': 'true' }],
      ['garbage booleans', { 'settings-postFullSizeImages': 'yes', 'settings-autoplayAnimatedMedia': '1' }]
    ])(
      'hydrates the server-rendered posts with %s',
      async (_, storage) => {
        const { page, problems } = await coldLoad('/posts/safebooru.org', storage)

        await page.getByTestId(`safebooru.org-${firstPostId}`).first().waitFor({ state: 'visible' })
        await scrollToRow(page, nextPageRow)

        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )
  })

  describe('home page', () => {
    it.each([
      ['a known booru', 'safebooru.org'],
      ['a premium-only booru', 'gelbooru.com'],
      ['an unknown booru', 'unknown.example'],
      ['garbage', '{"not":"a domain"}']
    ])(
      'hydrates with %s as the last used booru',
      async (_, domain) => {
        const { page, problems } = await coldLoad('/', { 'user-selectedBooru': domain })

        await page.getByTestId('domain-selector').first().waitFor({ state: 'visible' })

        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )

    it.each([
      ['corrupt JSON', '{"path":'],
      ['a non-array', '{"path":"/posts/safebooru.org"}'],
      ['entries without a path', '[{"date":"2026-01-01"},null,42]'],
      ['an unknown route', '[{"path":"/does-not-exist","date":"2026-01-01T00:00:00.000Z"}]']
    ])(
      'renders the page history from %s',
      async (_, value) => {
        const { page, problems } = await coldLoad('/', { 'settings-pageHistory': value })

        await page.getByTestId('domain-selector').first().waitFor({ state: 'visible' })
        // The history section loads in an idle callback
        await page.evaluate(() => new Promise((resolve) => requestIdleCallback(() => setTimeout(resolve, 1000))))
        await page.waitForLoadState('networkidle')

        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )

    it.each([
      ['corrupt JSON', '{"path":'],
      ['a non-array', '{"path":"/posts/safebooru.org"}'],
      ['entries without a path', '[{"date":"2026-01-01"},null,42]']
    ])(
      'records a search on top of a page history from %s',
      async (_, value) => {
        const { page, problems } = await coldLoad('/posts/safebooru.org?tags=hair_bun', {
          'settings-pageHistory': value
        })

        await page.getByTestId(`safebooru.org-${firstPostId}`).first().waitFor({ state: 'visible' })
        await pushRoute(page, '/posts/safebooru.org?tags=1girl')

        await expect
          .poll(() => page.evaluate(() => window.localStorage.getItem('settings-pageHistory')))
          .toContain('"path":"/posts/safebooru.org?tags=1girl"')
        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )
  })

  it('previews a premium-only booru with every setting changed at once', async () => {
    const { page, problems, requests } = await coldLoad('/posts/gelbooru.com?tags=ai_first_post_test', {
      'settings-postsPerPage': '3',
      'settings-postFullSizeImages': 'true',
      'settings-autoplayAnimatedMedia': 'true',
      'settings-blockAiGeneratedImages': 'true',
      'user-selectedList': 'default',
      'user-selectedBooru': 'unknown.example'
    })

    await page.getByTestId(`gelbooru.com-${secondPostId}`).first().waitFor({ state: 'visible' })
    await scrollToRow(page, 7)
    await page.getByTestId('premium-booru-promotion').waitFor({ state: 'visible' })

    expect(await page.getByTestId(`gelbooru.com-${firstPostId}`).count()).toBe(0)
    expect(requests.map((params) => params.get('limit')).filter((limit) => limit !== '29')).toEqual([])
    expect(await readNuxtError(page)).toBeNull()
    expect(problems).toEqual([])
  }, 45000)
})
