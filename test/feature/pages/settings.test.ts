import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('/settings', async () => {
  await setup({
    browser: true
  })

  it('renders', async () => {
    const page = await createPage('/settings')

    await page.waitForSelector('h1')

    expect(await page.textContent('h1')).toBe('Settings')
  })
})
