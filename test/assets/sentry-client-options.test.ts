import { describe, expect, it } from 'vitest'
import type * as Sentry from '@sentry/nuxt'
import {
  buildSentryClientInitOptions,
  isChunkLoadError,
  isSafariNativeTrackMenuError,
  isUnknownOrExtensionError
} from '../../sentry.client.options'

describe('Sentry client options', () => {
  const mockSentry = {
    replayIntegration: (options: unknown) => ({ name: 'Replay', options }),
    thirdPartyErrorFilterIntegration: (options: unknown) => ({ name: 'ThirdPartyErrorFilter', options })
  } as unknown as typeof import('@sentry/nuxt')

  it('does not opt in to default PII collection', () => {
    const options = buildSentryClientInitOptions({
      dsn: 'https://example.com/1',
      Sentry: mockSentry
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

  describe('isUnknownOrExtensionError', () => {
    it('identifies events with no message and no exception value as unknown', () => {
      expect(isUnknownOrExtensionError({})).toBe(true)
      expect(isUnknownOrExtensionError({ message: '' })).toBe(true)
      expect(isUnknownOrExtensionError({ message: '<unknown>' })).toBe(true)
      expect(isUnknownOrExtensionError({ message: 'Script error.' })).toBe(true)
    })

    it('identifies exception with <unknown> value or Script error.', () => {
      expect(
        isUnknownOrExtensionError({
          exception: {
            values: [{ value: '<unknown>', type: '<unknown>' }]
          }
        })
      ).toBe(true)

      expect(
        isUnknownOrExtensionError({
          exception: {
            values: [{ value: 'Script error.', type: 'Error' }]
          }
        })
      ).toBe(true)
    })

    it('retains real application exceptions', () => {
      expect(
        isUnknownOrExtensionError({
          exception: {
            values: [{ value: 'Cannot read properties of undefined', type: 'TypeError' }]
          }
        })
      ).toBe(false)
    })
  })

  describe('isChunkLoadError', () => {
    it('identifies dynamic chunk fetch failures across browsers', () => {
      expect(
        isChunkLoadError({
          exception: {
            values: [{ value: 'TypeError: Failed to fetch dynamically imported module: https://r34.app/_nuxt/abc.js' }]
          }
        })
      ).toBe(true)

      expect(
        isChunkLoadError({
          exception: {
            values: [{ value: 'TypeError: Importing a module script failed.' }]
          }
        })
      ).toBe(true)

      expect(
        isChunkLoadError({
          exception: {
            values: [{ value: 'error loading dynamically imported module: https://r34.app/_nuxt/xyz.js' }]
          }
        })
      ).toBe(true)
    })

    it('does not match normal application errors', () => {
      expect(
        isChunkLoadError({
          exception: {
            values: [{ value: 'TypeError: Cannot read properties of null' }]
          }
        })
      ).toBe(false)
    })
  })

  describe('beforeSend filtering and chunk downsampling', () => {
    it('drops unknown cross-origin extension errors', () => {
      const options = buildSentryClientInitOptions({
        dsn: 'https://example.com/1',
        Sentry: mockSentry
      })

      const beforeSend = options.beforeSend as (event: Sentry.Event) => Sentry.ErrorEvent | null

      const result = beforeSend({
        message: '<unknown>'
      })

      expect(result).toBeNull()
    })

    it('samples chunk load errors when sample rate is met and tags the event', () => {
      const options = buildSentryClientInitOptions({
        dsn: 'https://example.com/1',
        Sentry: mockSentry,
        chunkErrorSampleRate: 1.0 // 100% sample rate for test
      })

      const beforeSend = options.beforeSend as (event: Sentry.Event) => Sentry.ErrorEvent | null

      const event: Sentry.Event = {
        exception: {
          values: [{ value: 'Failed to fetch dynamically imported module: https://r34.app/_nuxt/chunk.js' }]
        },
        tags: {}
      }

      const result = beforeSend(event)

      expect(result).not.toBeNull()
      expect(result?.tags).toMatchObject({
        sampled_chunk_error: 'true',
        sample_rate: '1'
      })
    })

    it('drops chunk load errors when not sampled', () => {
      const options = buildSentryClientInitOptions({
        dsn: 'https://example.com/1',
        Sentry: mockSentry,
        chunkErrorSampleRate: 0.0 // 0% sample rate for test
      })

      const beforeSend = options.beforeSend as (event: Sentry.Event) => Sentry.ErrorEvent | null

      const event: Sentry.Event = {
        exception: {
          values: [{ value: 'Failed to fetch dynamically imported module: https://r34.app/_nuxt/chunk.js' }]
        }
      }

      const result = beforeSend(event)

      expect(result).toBeNull()
    })
  })
})
