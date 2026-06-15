import { describe, expect, it } from 'vitest'
import { getRecoverableChunkLoadMessage } from '../../app/assets/js/chunk-load-errors'

describe('chunk load errors', () => {
  it('recognizes recoverable dynamic import failures', () => {
    expect(getRecoverableChunkLoadMessage(new TypeError('Importing a module script failed.'))).toBe(
      'Importing a module script failed.'
    )
    expect(getRecoverableChunkLoadMessage(new Error('Failed to fetch dynamically imported module'))).toBe(
      'Failed to fetch dynamically imported module'
    )
    expect(getRecoverableChunkLoadMessage(new Error('Cannot read properties of null'))).toBeNull()
  })
})
