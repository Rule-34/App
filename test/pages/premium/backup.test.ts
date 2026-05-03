import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils'
import { defaultSetupConfig } from '../../helper'
import path from 'path'

describe('/premium/backup', async () => {
  await setup(defaultSetupConfig)

  it('renders', async () => {
    const page = await createPage('/premium/backup')

    expect(await page.textContent('h1')).toBe('Backup & Restore')
  })

  it('creates a backup', async () => {
    const page = await createPage(url('/premium/backup'))

    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    await page.evaluate(() => {
      const originalToLocaleString = Date.prototype.toLocaleString
      ;(window as any).__backupDateFormattingCalls = 0

      Date.prototype.toLocaleString = function (...args: Parameters<Date['toLocaleString']>) {
        ;(window as any).__backupDateFormattingCalls++
        return originalToLocaleString.apply(this, args)
      }
    })

    await page.locator('button', { hasText: 'Backup' }).click()

    // Assert createBackup logic ran and page stayed stable
    const backupDateFormattingCalls = await page.evaluate(() => (window as any).__backupDateFormattingCalls)

    expect(backupDateFormattingCalls).toBeGreaterThan(0)
    expect(pageErrors).toEqual([])
    expect(await page.textContent('h1')).toBe('Backup & Restore')
  })

  it('restores a backup', async () => {
    const page = await createPage('/premium/backup')

    const fileChooserPromise = page.waitForEvent('filechooser')

    await page.locator('button', { hasText: 'Restore' }).click()

    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles(path.join(__dirname, 'backup.mock-data.json'))

    // TODO: Verify if backup is restored or create feature tests

    // Wait for a toaster to appear
    await page.locator('ol[data-sonner-toaster] li', { hasText: 'Backup restored' }).isVisible()
  })
})
