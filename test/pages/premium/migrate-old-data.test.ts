import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { migratedTagCollectionsMock, oldLocalStorageVuexUserMock } from './migrate-old-data.mock-data'
import { defaultSetupConfig } from '../../helper'

describe('/premium/migrate-old-data', async () => {
  await setup(defaultSetupConfig)

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

    // === Act

    await page.getByRole('button', { name: /Migrate/i }).click()

    // TODO: Check on settings page
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

    const isLocalStorageCleaned = await page.evaluate(() => {
      return localStorage.getItem('vuex-user') === null
    })

    const currentUrl = new URL(page.url())

    // === Assert

    expect(migratedSettings).toEqual({
      'settings-navigationTouchGestures': 'false',
      'settings-postFullSizeImages': 'true',
      'settings-postsPerPage': '69'
    })

    expect(migratedTagCollections).toEqual(migratedTagCollectionsMock)

    // TODO: Test migrated Boorus
    // TODO: Test saved posts
    // TODO: Test by going to the respective pages instead of checking technical stuff

    expect(isLocalStorageCleaned).toBe(true)

    // Redirected successfully
    expect(currentUrl.pathname).toBe('/premium')
  })
})
