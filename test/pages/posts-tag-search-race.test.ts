import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

describe('posts page tag search', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  it('keeps suggestions in sync with the latest query when responses arrive out of order', async () => {
    // Arrange
    const page = await createTrackedPage('/posts/safebooru.org')

    let tagSearchRequests = 0

    await page.route('**/booru/*/tags*', async (route) => {
      tagSearchRequests += 1

      // The first query's response lands after the second one's, simulating
      // a slow upstream that answers out of order.
      const isFirstQuery = tagSearchRequests === 1

      if (isFirstQuery) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              name: isFirstQuery ? 'albatross' : 'albert_einstein',
              type: 'general',
              count: 1
            }
          ]
        })
      })
    })

    // Act
    await page.getByLabel('Search posts').click()

    const dialog = page.getByRole('dialog')
    const input = dialog.getByRole('combobox')
    await input.waitFor({ state: 'visible', timeout: 10000 })
    await input.click()

    // Query 1: "al" → the 350ms debounce fires the slow request
    await page.keyboard.type('al', { delay: 50 })
    await page.waitForTimeout(600)

    // Query 2: "albe" → the debounce fires the fast request
    await page.keyboard.type('be', { delay: 50 })

    const currentOption = dialog.getByRole('option', { name: /albert_einstein/ })
    await currentOption.waitFor({ state: 'visible', timeout: 10000 })

    // Give the late response to query 1 time to arrive and (if unguarded) be applied
    await page.waitForTimeout(1600)

    // Assert
    const optionTexts = await dialog.getByRole('option').allTextContents()

    expect(optionTexts.some((text) => text.includes('albert_einstein'))).toBe(true)
    expect(optionTexts.some((text) => text.includes('albatross'))).toBe(false)
    expect(tagSearchRequests).toBe(2)
  }, 30000)
})
