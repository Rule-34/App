import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { mockPostsPageWithOfflineVideo } from './posts.mock-data'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'
import { addPocketBaseAuthCookie, createPocketBaseMockState, mockPocketBase } from '../pocketbase-mock'

function decodeImgproxySourceUrl(src: string) {
  const encodedSource = src.split('/').pop()

  if (!encodedSource) {
    return null
  }

  const base64 = encodedSource.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  return Buffer.from(paddedBase64, 'base64').toString('utf8')
}

function expectPosterSrcToReference(src: string | null, expectedUrl: string) {
  expect(src).toBeTruthy()

  if (src?.startsWith('https://imgproxy2.r34.app/')) {
    expect(decodeImgproxySourceUrl(src)).toBe(`http://nginx-proxy/proxy?url=${expectedUrl}`)
    return
  }

  expect(src).toBe(expectedUrl)
}

type TrackedPage = Awaited<ReturnType<ReturnType<typeof useTrackedPageFactory>>>

async function getPostVideoPoster(page: TrackedPage, testId: string) {
  await page.waitForFunction(
    (id) => document.querySelector(`[data-testid="${id}"] video`)?.getAttribute('poster'),
    testId,
    { timeout: 10000 }
  )

  return page.evaluate(
    (id) => document.querySelector(`[data-testid="${id}"] video`)?.getAttribute('poster') ?? null,
    testId
  )
}

describe('Video poster proxying', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()
  const offlineVideoPost = mockPostsPageWithOfflineVideo.data[0]!
  const postTestId = `safebooru.org-${offlineVideoPost.id}`

  it('proxies blocked video posters and playback for premium users', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState()

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/auth-refresh') && response.ok()),
      page.goto(url('/posts/safebooru.org?tags=offline_video_test'), { waitUntil: 'domcontentloaded' })
    ])

    const post = page.getByTestId(postTestId).first()
    await post.waitFor({ state: 'visible' })
    await page
      .locator('button[aria-label="Save post"], button[aria-label="Unsave post"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })

    const posterPreloadImage = post.locator('img.sr-only')
    await posterPreloadImage.waitFor({ state: 'attached' })
    await posterPreloadImage.evaluate((image) => {
      image.dispatchEvent(new Event('error'))
    })

    await expect
      .poll(async () => getPostVideoPoster(page, postTestId), { timeout: 15000 })
      .toContain(`q=${encodeURIComponent(offlineVideoPost.preview_file.url)}`)

    await page.route('https://example.local/videos/**', (route) => route.abort('failed'))

    const video = post.locator('video')
    await video.waitFor({ state: 'visible' })
    await video.evaluate((videoElement) => {
      videoElement.load()
      videoElement.dispatchEvent(new Event('error'))
    })

    await expect
      .poll(
        async () =>
          page.evaluate(
            (id) => document.querySelector(`[data-testid="${id}"] video`)?.getAttribute('src') ?? null,
            postTestId
          ),
        { timeout: 15000 }
      )
      .toContain(`q=${encodeURIComponent(offlineVideoPost.high_res_file.url)}`)
  }, 30000)

  it('proxies video poster through imgproxy on SSR for blocked preview URLs', async () => {
    const page = await createTrackedPage()

    await page.goto(url('/posts/safebooru.org?tags=offline_video_test'), { waitUntil: 'domcontentloaded' })
    await page.getByTestId(postTestId).first().waitFor({ state: 'visible' })

    expectPosterSrcToReference(await getPostVideoPoster(page, postTestId), offlineVideoPost.preview_file.url)
  }, 20000)
})
