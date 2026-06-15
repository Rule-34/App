import { describe, expect, it } from 'vitest'
import { isRecoverableChunkLoadError, isSafariNativeTrackMenuError } from '../../sentry.client.options'

describe('Sentry client options', () => {
  it('identifies Safari native track menu errors', () => {
    expect(
      isSafariNativeTrackMenuError({
        exception: {
          values: [
            {
              stacktrace: {
                frames: [
                  {
                    function: 'sortedTrackListForMenu',
                    filename: '[native code]'
                  }
                ]
              }
            }
          ]
        }
      })
    ).toBe(true)
  })

  it('does not match unrelated native errors', () => {
    expect(
      isSafariNativeTrackMenuError({
        exception: {
          values: [
            {
              stacktrace: {
                frames: [
                  {
                    function: 'webkitEnterFullscreen',
                    filename: '[native code]'
                  }
                ]
              }
            }
          ]
        }
      })
    ).toBe(false)
  })

  it('identifies recoverable chunk load errors', () => {
    expect(
      isRecoverableChunkLoadError({
        exception: {
          values: [
            {
              value: 'Importing a module script failed.'
            }
          ]
        }
      })
    ).toBe(true)

    expect(
      isRecoverableChunkLoadError({
        exception: {
          values: [
            {
              value: 'Cannot read properties of null'
            }
          ]
        }
      })
    ).toBe(false)
  })
})
