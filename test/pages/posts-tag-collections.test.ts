import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { mockPostsPage0 } from './posts.mock-data'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'
import { addPocketBaseAuthCookie, createPocketBaseMockState, mockPocketBase } from '../pocketbase-mock'

const firstMockPost = mockPostsPage0.data[0]!

describe('Post tag collections', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  it('adds the clicked tag to an existing collection from the tag menu', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      tagCollectionRecords: [
        {
          id: 'collection-1',
          user_id: 'test-user',
          name: 'Favorites',
          tags: ['animated'],
          position: 1
        }
      ]
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    const firstPost = page.getByTestId(`safebooru.org-${firstMockPost.id}`).first()
    await firstPost.waitFor({ state: 'visible', timeout: 10000 })
    await firstPost.getByRole('button', { name: /tags/i }).click()

    const clickedTag = page.getByRole('button', { name: /1girl/i }).first()
    await clickedTag.click()

    const addToCollectionButton = page.locator('button').filter({ hasText: /Add to collection/i })
    await addToCollectionButton.waitFor({ state: 'visible', timeout: 10000 })
    await addToCollectionButton.click()
    await expect.poll(() => page.getByRole('dialog').count(), { timeout: 10000 }).toBe(1)
    await page.getByRole('button', { name: /favorites/i }).click()
    await expect
      .poll(() => page.getByText('Tag added to collection').first().isVisible(), { timeout: 10000 })
      .toBe(true)

    await expect.poll(() => pocketBase.tagCollectionRecords[0]?.tags, { timeout: 10000 }).toEqual(['animated', '1girl'])
  }, 60000)

  it('does not show added feedback when the clicked tag is already in the collection', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      tagCollectionRecords: [
        {
          id: 'collection-1',
          user_id: 'test-user',
          name: 'Favorites',
          tags: ['1girl'],
          position: 1
        }
      ]
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    const firstPost = page.getByTestId(`safebooru.org-${firstMockPost.id}`).first()
    await firstPost.waitFor({ state: 'visible', timeout: 10000 })
    await firstPost.getByRole('button', { name: /tags/i }).click()

    const clickedTag = page.getByRole('button', { name: /1girl/i }).first()
    await clickedTag.click()

    const addToCollectionButton = page.locator('button').filter({ hasText: /Add to collection/i })
    await addToCollectionButton.waitFor({ state: 'visible', timeout: 10000 })
    await addToCollectionButton.click()
    const batchWrite = page
      .waitForRequest((request) => request.method() === 'POST' && URL.parse(request.url())?.pathname === '/api/batch', {
        timeout: 1000
      })
      .then(() => true)
      .catch(() => false)

    await page.getByRole('button', { name: /favorites/i }).click()

    await expect(batchWrite).resolves.toBe(false)
    await expect.poll(() => page.getByText('Tag added to collection').first().isVisible()).toBe(false)
    await expect.poll(() => pocketBase.tagCollectionRecords[0]?.tags, { timeout: 10000 }).toEqual(['1girl'])
  }, 60000)

  it('creates a new collection from the clicked tag', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState({
      tagCollectionRecords: []
    })

    await mockPocketBase(page, pocketBase)
    await addPocketBaseAuthCookie(page, url('/'))
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    const firstPost = page.getByTestId(`safebooru.org-${firstMockPost.id}`).first()
    await firstPost.waitFor({ state: 'visible', timeout: 10000 })
    await firstPost.getByRole('button', { name: /tags/i }).click()

    const clickedTag = page.getByRole('button', { name: /1girl/i }).first()
    await clickedTag.click()

    const addToCollectionButton = page.locator('button').filter({ hasText: /Add to collection/i })
    await addToCollectionButton.waitFor({ state: 'visible', timeout: 10000 })
    await addToCollectionButton.click()

    page.once('dialog', async (dialog) => {
      await dialog.accept('Favorites')
    })

    await page.getByRole('button', { name: /create collection/i }).click()

    await expect
      .poll(() => pocketBase.tagCollectionRecords.find((record) => record.name === 'Favorites')?.tags, {
        timeout: 10000
      })
      .toEqual(['1girl'])
  }, 60000)

  it('opens the premium prompt when a non-premium user clicks add to collection', async () => {
    const page = await createTrackedPage()
    const pocketBase = createPocketBaseMockState()

    await page.context().clearCookies()
    await page.addInitScript(() => {
      window.localStorage.removeItem('pocketbase_auth')
      document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    })
    await mockPocketBase(page, pocketBase)
    await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

    const firstPost = page.getByTestId(`safebooru.org-${firstMockPost.id}`).first()
    await firstPost.waitFor({ state: 'visible', timeout: 10000 })
    await firstPost.getByRole('button', { name: /tags/i }).click()

    const clickedTag = page.getByRole('button', { name: /1girl/i }).first()
    await clickedTag.click()

    const addToCollectionButton = page.locator('button').filter({ hasText: /Add to collection/i })
    await addToCollectionButton.waitFor({ state: 'visible', timeout: 10000 })
    await addToCollectionButton.click()

    const premiumPrompt = page.getByRole('dialog').first()
    await premiumPrompt.waitFor({ state: 'attached', timeout: 10000 })
    await expect(premiumPrompt.getAttribute('data-headlessui-state')).resolves.toBe('open')
  }, 60000)
})
