import { readFileSync } from 'node:fs'
import { setup, url } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

const page = readFileSync(new URL('../../app/pages/__ad-debug/popunder.vue', import.meta.url), 'utf8')

describe('popunder debug page', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  it('uses passive instrumentation and a same-origin post link', () => {
    expect(page).not.toMatch(/window\.open\s*=/)
    expect(page).not.toMatch(/window\.location\.(assign|replace)\s*=/)
    expect(page).toContain('data-testid="reset-test-storage"')
    expect(page).toContain('localStorage.clear()')
    expect(page).toContain('sessionStorage.clear()')
    expect(page).toContain('ensurePopunderProviderContainer(selectedProvider.value)')
    expect(page).toContain('data-testid="click-test-target"')
    expect(page).toContain('href="/posts/rule34.xxx?tags=rating%3Asafe"')
  })

  it('injects Kadam with its required container and no crossorigin attribute', async () => {
    const browserPage = await createTrackedPage()
    await browserPage.route('https://hdbtop.com/code/hneuyk427249', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' })
    )
    await browserPage.goto(url('/__ad-debug/popunder?provider=kadam'))
    await browserPage.waitForFunction(
      () => document.querySelector('[data-testid="debug-report"]')?.textContent?.trim().length
    )

    expect(await browserPage.getByTestId('selected-provider').textContent()).toBe('Kadam')
    await browserPage.getByRole('button', { name: 'Arm ads' }).click()

    expect(await browserPage.locator('.hneuyk427249').count()).toBe(1)
    const script = browserPage.locator('script[src="https://hdbtop.com/code/hneuyk427249"]')
    expect(await script.count()).toBe(1)
    expect(await script.getAttribute('crossorigin')).toBeNull()
  })
})
