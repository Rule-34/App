import type { Page } from 'playwright'
import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { defaultSetupConfig, useTrackedPageFactory } from '../../helper'
import path from 'path'

let createTrackedPage: ReturnType<typeof useTrackedPageFactory>

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

async function mockPocketbaseAuthRefresh(page: Page) {
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
  const page = await createTrackedPage()
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

  await page.goto(backupUrl, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Backup & Restore', exact: true }).waitFor({ state: 'visible' })

  return page
}

describe('/premium/backup', async () => {
  await setup(defaultSetupConfig)

  createTrackedPage = useTrackedPageFactory()

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

    await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, 'backup.mock-data.json'))

    await page.waitForURL(
      (currentUrl) => currentUrl.pathname === '/premium/dashboard' && currentUrl.searchParams.get('restoreSuccess') === 'true',
      { waitUntil: 'commit' }
    )

    expect(pageErrors).toEqual([])
  }, 30000)
})
