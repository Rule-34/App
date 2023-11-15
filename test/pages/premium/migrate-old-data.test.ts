import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import {
  migratedBooruListMock,
  migratedTagCollectionsMock,
  oldLocalStorageVuexUserMock
} from './migrate-old-data.mock-data'

oldLocalStorageVuexUserMock

describe('/premium/migrate-old-data', async () => {
  await setup({
    browser: true
  })

  it('renders', async () => {
    const page = await createPage('/premium/migrate-old-data')

    await page.waitForSelector('h1')

    expect(await page.textContent('h1')).toBe('Migrate old data')
  })

  it('migrates old data', async () => {
    const page = await createPage('/premium/migrate-old-data')

    // === Arrange

    // Load data to localStorage - https://azamuddin.com/en/notes/11032023-playwright-set-localstorage
    await page.evaluate((localStorageVuexUserMock) => {
      localStorage.setItem('vuex-user', localStorageVuexUserMock)
    }, JSON.stringify(oldLocalStorageVuexUserMock))

    // await page.reload()

    // === Act

    await page.getByRole('button', { name: /Migrate/i }).click()

    const migratedSettings = await page.evaluate(() => {
      return {
        'settings-navigationTouchGestures': localStorage.getItem('settings-navigationTouchGestures'),
        'settings-postFullSizeImages': localStorage.getItem('settings-postFullSizeImages'),
        'settings-postsPerPage': localStorage.getItem('settings-postsPerPage')
      }
    })

    const migratedTagCollections = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('user-tagCollections')!)
    })

    const migratedBoorus = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('user-booruList')!)
    })

    // TODO: Test saved posts

    const isLocalStorageCleaned = await page.evaluate(() => {
      return localStorage.getItem('vuex-user') === null
    })

    const currentUrl = new URL(page.url())

    // === Assert

    // Redirected successfully
    expect(currentUrl.pathname).toBe('/premium')

    expect(migratedSettings).toEqual({
      'settings-navigationTouchGestures': 'false',
      'settings-postFullSizeImages': 'true',
      'settings-postsPerPage': '69'
    })

    expect(migratedTagCollections).toEqual(migratedTagCollectionsMock)

    expect(migratedBoorus).toEqual(migratedBooruListMock)

    expect(isLocalStorageCleaned).toBe(true)
  })
})
