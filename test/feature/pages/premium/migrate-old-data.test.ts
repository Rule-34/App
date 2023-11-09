import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

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

    // Load data to localStorage

    // Click Button

    // Check data is in IndexedDB & localStorage
  })
})
