import { FetchError } from 'ofetch'
import { describe, expect, it } from 'vitest'
import { shouldReportTagSearchError } from '../../app/assets/js/tag-search-error'

describe('tag search error reporting', () => {
  it('does not report handled fetch failures to Sentry', () => {
    expect(shouldReportTagSearchError(new FetchError('Service unavailable'))).toBe(false)
  })

  it('reports unexpected non-fetch errors to Sentry', () => {
    expect(shouldReportTagSearchError(new Error('Unexpected tag search failure'))).toBe(true)
  })
})
