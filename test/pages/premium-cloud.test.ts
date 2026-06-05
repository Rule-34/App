import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { mockPostsPage0 } from './posts.mock-data'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'
import { addPocketBaseAuthCookie, createPocketBaseMockState, mockPocketBase } from '../pocketbase-mock'
import type { IPocketbasePost } from '../../app/assets/js/pocketbase.dto'

const firstMockPost = mockPostsPage0.data[0]!
const firstSavedPostRecord = pocketBaseRecordFromPost(firstMockPost, 'safebooru.org')
const firstSavedPostSummary = {
  id: firstSavedPostRecord.id!,
  original_id: firstSavedPostRecord.original_id,
  original_domain: firstSavedPostRecord.original_domain
}

describe('Premium cloud flows', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  it('signs in from a license link and lands on the Premium dashboard experience', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState()

    await mockPocketBase(page, pocketBase)
    await page.goto(url('/premium/sign-in?license=test-license'), { waitUntil: 'domcontentloaded' })

    await page.waitForURL(/\/premium\/dashboard\?initialLogin=true/, { timeout: 10000 })
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor({ state: 'visible', timeout: 10000 })

    expect(pocketBase.requests).toContain('POST /api/collections/users/auth-with-password')
  }, 20000)

  it('uses cloud saved-post state without writing Premium saved summaries to localStorage', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      savedPostSummaries: [firstSavedPostSummary],
      savedPostRecords: [firstSavedPostRecord]
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    await page
      .locator('button[aria-label="Save post"], button[aria-label="Unsave post"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })

    await expect
      .poll(
        async () => ({
          saveButtonLabels: await page
            .locator('button[aria-label="Save post"], button[aria-label="Unsave post"]')
            .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')))
        }),
        { timeout: 10000 }
      )
      .toEqual(
        expect.objectContaining({
          saveButtonLabels: expect.arrayContaining(['Unsave post'])
        })
      )

    const premiumLocalStorageKeys = await page.evaluate(() =>
      Object.keys(window.localStorage).filter(
        (key) =>
          key.startsWith('pocketbase-savedPostList') ||
          key === 'user-tagCollections' ||
          key === 'user-booruList-2' ||
          key === 'user-customBlocklist'
      )
    )

    expect(premiumLocalStorageKeys).toEqual([])
  }, 20000)

  it('keeps saved-post actions disabled until cloud saved state loads', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      savedPostSummaries: [firstSavedPostSummary],
      savedPostRecords: [firstSavedPostRecord],
      delaySavedPostSummariesMs: 1500
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    const firstPost = page.getByTestId(`safebooru.org-${firstMockPost.id}`).first()
    const firstSaveButton = firstPost
      .locator(
        'button[aria-label="Save post"]:not([tabindex="-1"]), button[aria-label="Unsave post"]:not([tabindex="-1"])'
      )
      .first()

    await firstPost.waitFor({ state: 'visible', timeout: 10000 })
    await firstSaveButton.waitFor({ state: 'visible', timeout: 10000 })
    expect(await firstSaveButton.evaluate((button) => (button as HTMLButtonElement).disabled)).toBe(true)

    await firstSaveButton.evaluate((button) => (button as HTMLButtonElement).click())
    await expect.poll(() => firstSaveButton.getAttribute('aria-label'), { timeout: 10000 }).toBe('Unsave post')

    expect(pocketBase.requests.filter((request) => request === 'POST /api/collections/posts/records')).toEqual([])
  }, 20000)

  it('disables saved-post actions while the cloud write is pending', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      delaySavedPostMutationMs: 500
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    const firstPost = page.getByTestId(`safebooru.org-${firstMockPost.id}`).first()
    const firstSaveButton = firstPost
      .locator(
        'button[aria-label="Save post"]:not([tabindex="-1"]), button[aria-label="Unsave post"]:not([tabindex="-1"])'
      )
      .first()

    await firstPost.waitFor({ state: 'visible', timeout: 10000 })
    await firstSaveButton.waitFor({ state: 'visible', timeout: 10000 })
    await expect.poll(() => firstSaveButton.evaluate((button) => (button as HTMLButtonElement).disabled)).toBe(false)

    await firstSaveButton.click()
    await expect.poll(() => firstSaveButton.evaluate((button) => (button as HTMLButtonElement).disabled)).toBe(true)
    await expect.poll(() => firstSaveButton.getAttribute('aria-label'), { timeout: 10000 }).toBe('Unsave post')

    expect(pocketBase.requests.filter((request) => request === 'POST /api/collections/posts/records')).toHaveLength(1)
  }, 20000)

  it('loads all saved posts from the hardcoded saved-posts domain without domain discovery', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      savedPostSummaries: [firstSavedPostSummary],
      savedPostRecords: [firstSavedPostRecord]
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/premium/saved-posts/r34.app'), { waitUntil: 'domcontentloaded' })

    await page.locator('figure').first().waitFor({ state: 'visible', timeout: 10000 })

    expect(pocketBase.requests.some((request) => request.includes('distinct_original_domain_from_posts'))).toBe(false)
  }, 20000)

  it('redirects old saved-post domain URLs to the all-posts domain while preserving filters', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      savedPostSummaries: [firstSavedPostSummary],
      savedPostRecords: [firstSavedPostRecord]
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/premium/saved-posts/safebooru.org?filter%5Bsort%5D=-score'), {
      waitUntil: 'domcontentloaded'
    })

    await page.waitForURL(
      (currentUrl) =>
        currentUrl.pathname === '/premium/saved-posts/r34.app' &&
        currentUrl.searchParams.get('filter[sort]') === '-score',
      { timeout: 10000 }
    )
    await page.locator('figure').first().waitFor({ state: 'visible', timeout: 10000 })

    expect(pocketBase.requests.some((request) => request.includes('distinct_original_domain_from_posts'))).toBe(false)
  }, 20000)
})

function pocketBaseRecordFromPost(post: (typeof mockPostsPage0.data)[number], domain: string): IPocketbasePost {
  return {
    id: `saved-post-${post.id}`,
    user_id: 'test-user',
    created: '2026-05-31T00:00:00.000Z',
    updated: '2026-05-31T00:00:00.000Z',
    original_id: post.id,
    original_domain: domain,
    high_res_file: post.high_res_file.url ?? '',
    high_res_file_width: post.high_res_file.width ?? undefined,
    high_res_file_height: post.high_res_file.height ?? undefined,
    low_res_file: post.low_res_file.url ?? undefined,
    low_res_file_width: post.low_res_file.width ?? undefined,
    low_res_file_height: post.low_res_file.height ?? undefined,
    preview_file: post.preview_file.url ?? '',
    preview_file_width: post.preview_file.width ?? undefined,
    preview_file_height: post.preview_file.height ?? undefined,
    tags_artist: post.tags.artist,
    tags_character: post.tags.character,
    tags_copyright: post.tags.copyright,
    tags_general: post.tags.general,
    tags_meta: post.tags.meta,
    score: post.score ?? undefined,
    sources: post.sources,
    rating: post.rating ?? undefined,
    media_type: post.media_type ?? undefined
  }
}
