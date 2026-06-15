import { describe, expect, it, vi } from 'vitest'
import { isSafariNativeTrackMenuError, shouldDropRecoverableChunkLoadEvent } from '../../sentry.client.options'

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

  it('drops recoverable chunk load errors after the tab has already attempted chunk recovery', async () => {
    const { chunkRecoveryStorageKeyPrefix } = await import('../../app/assets/js/chunk-error-recovery')
    const originalWindow = globalThis.window
    const originalSessionStorage = globalThis.sessionStorage
    const recentRecoveryAttempt = Date.now()

    vi.stubGlobal('window', { location: { href: 'https://r34.app/posts/rule34.xxx' } })
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) =>
        key === `${chunkRecoveryStorageKeyPrefix}:https://r34.app/posts/rule34.xxx`
          ? String(recentRecoveryAttempt)
          : null
    })

    expect(
      shouldDropRecoverableChunkLoadEvent({
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
      shouldDropRecoverableChunkLoadEvent({
        exception: {
          values: [
            {
              value: 'Cannot read properties of null'
            }
          ]
        }
      })
    ).toBe(false)

    vi.stubGlobal('window', originalWindow)
    vi.stubGlobal('sessionStorage', originalSessionStorage)
  })
})
