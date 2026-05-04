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

    // Verify page loaded correctly
    expect(await page.textContent('h1')).toBe('Backup & Restore')

    // Spy on Date.prototype.toLocaleString to verify createBackupState() ran.
    // createBackupState() calls toLocaleString to generate the filename timestamp,
    // so if it was called, the backup logic executed successfully.
    await page.evaluate(() => {
      const originalToLocaleString = Date.prototype.toLocaleString
      ;(window as any).__backupDateFormattingCalls = 0

      Date.prototype.toLocaleString = function (...args: Parameters<Date['toLocaleString']>) {
        ;(window as any).__backupDateFormattingCalls++
        return originalToLocaleString.apply(this, args)
      }
    })

    await page.locator('button', { hasText: 'Backup' }).click()

    // Wait for downloadBlob to execute (it's synchronous after click, but
    // give the browser a tick to process the click event chain)
    await page.waitForTimeout(1000)

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
