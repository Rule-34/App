import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { defaultSetupConfig } from '../helper'

describe('/friends', async () => {
  await setup(defaultSetupConfig)

  it('renders', async () => {
    const page = await createPage('/friends')

    await page.waitForSelector('h1')

    expect(await page.textContent('h1')).toBe('Friends')
  })
})
