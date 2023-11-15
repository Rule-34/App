import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { defaultBrowserOptions } from '../../helper'
import path from 'path'

describe('/premium/backup', async () => {
  await setup({
    browser: true,
    browserOptions: defaultBrowserOptions
  })

  it('renders', async () => {
    const page = await createPage('/premium/backup')

    expect(await page.textContent('h1')).toBe('Backup & Restore')
  })

  it('creates a backup', async () => {
    const page = await createPage('/premium/backup')

    await Promise.all([
      //
      page.locator('button', { hasText: 'Backup' }).click(),

      page.waitForEvent('download')
    ])
  })

  it('restores a backup', async () => {
    const page = await createPage('/premium/backup')

    const fileChooserPromise = page.waitForEvent('filechooser')

    await page.locator('button', { hasText: 'Restore' }).click()

    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles(path.join(__dirname, 'backup.mock-data.json'))

    // Wait for a toaster to appear
    await page.locator('ol[data-sonner-toaster] li', { hasText: 'Backup restored' }).isVisible()
  })
})
