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

  it('shows the first lazy toast after rendering the toaster', async () => {
    const page = await createTrackedPage('/settings')

    await page.getByRole('button', { name: /Tag block list None/ }).click()
    await page.getByRole('option', { name: 'Custom' }).click()

    await page
      .getByText('You need to be a Premium member to use the custom blocklist')
      .waitFor({ state: 'visible', timeout: 5000 })
  }, 15000)
})
