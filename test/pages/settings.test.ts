import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

describe('/settings', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  it('renders', async () => {
    const page = await createTrackedPage('/settings')

    await page.waitForSelector('h1')

    expect(await page.textContent('h1')).toBe('Settings')
  })
})
