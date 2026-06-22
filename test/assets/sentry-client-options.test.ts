import { describe, expect, it } from 'vitest'
import { buildSentryClientInitOptions, isSafariNativeTrackMenuError } from '../../sentry.client.options'

describe('Sentry client options', () => {
  it('does not opt in to default PII collection', () => {
    const options = buildSentryClientInitOptions({
      dsn: 'https://example.com/1',
      Sentry: {
        replayIntegration: (options: unknown) => ({ name: 'Replay', options }),
        thirdPartyErrorFilterIntegration: (options: unknown) => ({ name: 'ThirdPartyErrorFilter', options })
      } as typeof import('@sentry/nuxt')
    }) as Record<string, unknown>

    expect(options).not.toHaveProperty('sendDefaultPii')
  })

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
})
