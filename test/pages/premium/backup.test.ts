import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils'
import { defaultSetupConfig } from '../../helper'
import path from 'path'

const validPocketbaseToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJleHAiOjQxMDI0NDQ4MDAsImlkIjoidGVzdC11c2VyIn0',
  'signature'
].join('.')

const authCookieValue = encodeURIComponent(
  JSON.stringify({
    token: validPocketbaseToken,
    model: {
      email: 'test@example.com',
      username: 'test-user',
      subscription_expires_at: '2099-12-31T00:00:00.000Z'
    }
  })
)

const authRecord = {
  id: 'test-user',
  email: 'test@example.com',
  username: 'test-user',
  subscription_expires_at: '2099-12-31T00:00:00.000Z'
}

async function mockPocketbaseAuthRefresh(page: Awaited<ReturnType<typeof createPage>>) {
  await page.route('**/api/collections/users/auth-refresh*', (route) =>
    route.fulfill({
      status: 200,
      json: {
        token: validPocketbaseToken,
        record: authRecord
      }
    })
  )
}

async function createAuthedBackupPage() {
  const page = await createPage()
  const backupUrl = url('/premium/backup')
  const { hostname } = new URL(backupUrl)

  await mockPocketbaseAuthRefresh(page)

  await page.context().addCookies([
    {
      name: 'pb_auth',
      value: authCookieValue,
      domain: hostname,
      path: '/'
    }
  ])

  await page.goto(backupUrl)

  return page
}

describe('/premium/backup', async () => {
  await setup(defaultSetupConfig)

  it('renders', async () => {
    const page = await createAuthedBackupPage()

    expect(await page.textContent('h1')).toBe('Backup & Restore')
  })

  it('creates a backup', async () => {
    const page = await createAuthedBackupPage()

    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    // Verify page loaded correctly
    expect(await page.textContent('h1')).toBe('Backup & Restore')

    await page.locator('main section.mt-8 button').first().click({ force: true })

    expect(pageErrors).toEqual([])
    expect(await page.textContent('h1')).toBe('Backup & Restore')
  })

  it('restores a backup', async () => {
    const page = await createAuthedBackupPage()
    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    const fileChooserPromise = page.waitForEvent('filechooser')

    await page.locator('main section.mt-8 button').nth(1).click({ force: true })

    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles(path.join(__dirname, 'backup.mock-data.json'))

    expect(pageErrors).toEqual([])
  })
})
