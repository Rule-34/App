import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('/friends', async () => {
  await setup({
    browser: true
  })

  it('renders', async () => {
    const page = await createPage('/friends')

    await page.waitForSelector('h1')

    expect(await page.textContent('h1')).toBe('Friends')
  })
})
