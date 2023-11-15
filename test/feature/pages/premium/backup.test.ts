import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'

describe('/premium/backup', async () => {
  await setup({
    browser: true
  })

  it('renders', async () => {
    const page = await createPage('/premium/backup')

    await page.waitForSelector('h1')

    expect(await page.textContent('h1')).toBe('Backup & Restore')
  })

  it('creates a backup', async () => {
    throw new Error('Not implemented')
  })

  it('restores a backup', async () => {
    throw new Error('Not implemented')
  })
})
