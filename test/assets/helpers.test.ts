import type * as Sentry from '@sentry/nuxt'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  generatePostTagLandingPath,
  generatePostsRoute,
  getFilterQueryValue,
  getSinglePositiveTagQueryValue
} from '../../app/assets/js/RouterHelper'
import { buildFluidPlayerOptions, getVideoAdList } from '../../app/assets/js/fluid-player-options'
import { normalizeStringForTitle } from '../../app/assets/js/SeoHelper'
import Tag from '../../app/assets/js/tag.dto'
import { measureVirtualItemsAfterVueUpdate } from '../../app/assets/js/virtualizer-measurement'
import { isPremiumRoute } from '../../app/composables/useDialogManagerState'
import { project } from '../../config/project'
import {
  buildSentryClientInitOptions,
  ignoreErrors,
  isChunkLoadError,
  isSafariNativeTrackMenuError,
  isUnknownOrExtensionError
} from '../../sentry.client.options'

vi.mock('~~/config/project', () => import('../../config/project'))

let proxyUrl: typeof import('../../app/assets/js/proxy').proxyUrl
let sidebarLinks: typeof import('../../app/assets/js/sidebarLinks').sidebarLinks

beforeAll(async () => {
  ;({ proxyUrl } = await import('../../app/assets/js/proxy'))
  ;({ sidebarLinks } = await import('../../app/assets/js/sidebarLinks'))
})

describe('proxyUrl', () => {
  it('generates a proxy URL targeting the production api/cors-proxy/ endpoint with the query parameter', () => {
    const targetUrl = 'https://example.com/image.png'
    const result = proxyUrl(targetUrl)

    const parsed = new URL(result)
    expect(parsed.origin).toBe(project.urls.production.origin)
    expect(parsed.pathname).toBe('/api/cors-proxy/')
    expect(parsed.searchParams.get('q')).toBe(targetUrl)
    expect(parsed.searchParams.has('download')).toBe(false)
  })

  it('includes the download query parameter when downloadName is provided', () => {
    const targetUrl = 'https://example.com/video.mp4'
    const downloadName = 'sample_video.mp4'
    const result = proxyUrl(targetUrl, downloadName)

    const parsed = new URL(result)
    expect(parsed.origin).toBe(project.urls.production.origin)
    expect(parsed.pathname).toBe('/api/cors-proxy/')
    expect(parsed.searchParams.get('q')).toBe(targetUrl)
    expect(parsed.searchParams.get('download')).toBe(downloadName)
  })

  it('correctly preserves and encodes query parameters in the target URL', () => {
    const targetUrl = 'https://cdn.example.org/media?size=large&format=webp'
    const result = proxyUrl(targetUrl)

    const parsed = new URL(result)
    expect(parsed.searchParams.get('q')).toBe(targetUrl)
  })
})

describe('sidebarLinks', () => {
  it('contains the complete set of primary navigation links with valid structure', () => {
    const linkIds = sidebarLinks.map((link) => link.id)

    expect(linkIds).toEqual(['home', 'other-sites', 'install-app', 'faq', 'blog', 'legal', 'settings'])

    for (const link of sidebarLinks) {
      expect(link.nameKey).toMatch(/^nav\./)
      expect(typeof link.href).toBe('string')
      expect(link.href.length).toBeGreaterThan(0)
      expect(typeof link.isExternal).toBe('boolean')
      expect(link.icon).toBeDefined()
    }
  })

  it('correctly constructs dynamic production URLs for external links', () => {
    const installLink = sidebarLinks.find((link) => link.id === 'install-app')
    expect(installLink?.isExternal).toBe(true)
    expect(installLink?.href).toBe(`https://www.installpwa.com/from/${project.urls.production.hostname}`)

    const blogLink = sidebarLinks.find((link) => link.id === 'blog')
    expect(blogLink?.isExternal).toBe(true)
    expect(blogLink?.href).toBe(`${project.urls.production.toString()}blog`)
  })

  it('marks internal routing links with isExternal false and valid relative paths', () => {
    const internalLinks = sidebarLinks.filter((link) => !link.isExternal)

    for (const link of internalLinks) {
      expect(link.href.startsWith('/')).toBe(true)
    }
  })
})

describe('generatePostsRoute', () => {
  it('keeps raw tag values in route query objects', () => {
    const route = generatePostsRoute(
      '/posts',
      'safebooru.org',
      undefined,
      [new Tag({ name: 'panty_&_stocking_with_garterbelt' })],
      undefined
    )

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        tags: 'panty_&_stocking_with_garterbelt'
      }
    })
    expect(String(route.query?.tags)).toBe('panty_&_stocking_with_garterbelt')
  })

  it('keeps multiple tag values raw before router serialization', () => {
    const route = generatePostsRoute(
      '/posts',
      'safebooru.org',
      undefined,
      [new Tag({ name: 'panty_&_stocking_with_garterbelt' }), new Tag({ name: 'rating:safe' })],
      undefined
    )

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        tags: 'panty_&_stocking_with_garterbelt|rating:safe'
      }
    })

    expect(String(route.query?.tags)).toBe('panty_&_stocking_with_garterbelt|rating:safe')
  })

  it('keeps filters as flat bracket query keys for Vue Router', () => {
    const route = generatePostsRoute('/posts', 'safebooru.org', 2, [new Tag({ name: 'rating:safe' })], {
      rating: undefined,
      sort: 'score',
      score: '>=25'
    })

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        page: '2',
        tags: 'rating:safe',
        'filter[sort]': 'score',
        'filter[score]': '>=25'
      }
    })
    expect(route.query).not.toHaveProperty('filter')
    expect(route.query).not.toHaveProperty('filter[rating]')
  })

  it('reads flat and legacy nested filter query values', () => {
    expect(getFilterQueryValue({ 'filter[sort]': 'score' }, 'sort')).toBe('score')
    expect(getFilterQueryValue({ filter: { score: '>=25' } }, 'score')).toBe('>=25')
  })
})

describe('tag landing route helpers', () => {
  it('builds encoded single-tag landing paths under posts', () => {
    expect(generatePostTagLandingPath('rule34.xxx', 'honkai:_star_rail')).toBe('/posts/rule34.xxx/honkai%3A_star_rail')
    expect(generatePostTagLandingPath('rule34.xxx', '100%')).toBe('/posts/rule34.xxx/100%25')
  })

  it('accepts only single positive tag query values for landing pages', () => {
    expect(getSinglePositiveTagQueryValue('1girl')).toBe('1girl')
    expect(getSinglePositiveTagQueryValue('honkai:_star_rail')).toBe('honkai:_star_rail')
    expect(getSinglePositiveTagQueryValue('-ai_generated')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('bored|cum')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('big breasts')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('rating:safe')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue(['solo', 'cum'])).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue(undefined)).toBeUndefined()
    expect(getSinglePositiveTagQueryValue(null)).toBeUndefined()
    expect(getSinglePositiveTagQueryValue([null])).toBeUndefined()
  })
})

describe('normalizeStringForTitle', () => {
  it('returns null for empty strings or whitespace-only inputs', () => {
    expect(normalizeStringForTitle('')).toBeNull()
    expect(normalizeStringForTitle('   ')).toBeNull()
  })

  it('returns null for bare minus or whitespace following minus', () => {
    expect(normalizeStringForTitle('-')).toBeNull()
    expect(normalizeStringForTitle('-   ')).toBeNull()
  })

  it('formats single words in title case', () => {
    expect(normalizeStringForTitle('futanari')).toBe('Futanari')
    expect(normalizeStringForTitle('FEMALE')).toBe('Female')
  })

  it('converts underscore and hyphen delimited tags to space-separated title case', () => {
    expect(normalizeStringForTitle('overwatch_2')).toBe('Overwatch 2')
    expect(normalizeStringForTitle('hatsune_miku')).toBe('Hatsune Miku')
    expect(normalizeStringForTitle('high-resolution')).toBe('High Resolution')
  })

  it('preserves leading minus sign for negative tags while title-casing the tag content', () => {
    expect(normalizeStringForTitle('-female')).toBe('-Female')
    expect(normalizeStringForTitle('-overwatch_2')).toBe('-Overwatch 2')
    expect(normalizeStringForTitle('-hatsune_miku')).toBe('-Hatsune Miku')
  })
})

describe('isPremiumRoute', () => {
  it('matches Premium routes only', () => {
    expect(isPremiumRoute('premium')).toBe(true)
    expect(isPremiumRoute('premium-sign-in')).toBe(true)
    expect(isPremiumRoute('premium-dashboard')).toBe(true)
    expect(isPremiumRoute('index')).toBe(false)
    expect(isPremiumRoute('premium-content')).toBe(true)
    expect(isPremiumRoute('premium2')).toBe(false)
    expect(isPremiumRoute(Symbol('premium'))).toBe(false)
    expect(isPremiumRoute()).toBe(false)
  })
})

describe('virtualizer measurement', () => {
  it('cleans stale cached elements before measuring connected virtual rows', () => {
    const measured: Array<Element | null> = []
    const connected = { isConnected: true } as Element
    const disconnected = { isConnected: false } as Element

    measureVirtualItemsAfterVueUpdate({
      elements: [connected, null, disconnected],
      virtualizer: {
        measureElement(element) {
          measured.push(element)
        }
      }
    })

    expect(measured).toEqual([null, connected])
  })
})

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

  describe('ignoreErrors configuration', () => {
    function matchesIgnoreErrors(message: string): boolean {
      return ignoreErrors.some((pattern) => {
        if (typeof pattern === 'string') {
          return message.includes(pattern)
        }
        return pattern.test(message)
      })
    }

    it('matches generic network fetch failure messages', () => {
      expect(matchesIgnoreErrors('TypeError: Failed to fetch')).toBe(true)
      expect(matchesIgnoreErrors('Failed to fetch')).toBe(true)
      expect(matchesIgnoreErrors('TypeError: Load failed')).toBe(true)
    })

    it('does not match dynamic module import failures so they reach beforeSend', () => {
      expect(
        matchesIgnoreErrors('TypeError: Failed to fetch dynamically imported module: https://r34.app/_nuxt/entry.js')
      ).toBe(false)
      expect(matchesIgnoreErrors('Failed to fetch dynamically imported module: https://r34.app/_nuxt/index.js')).toBe(
        false
      )
    })
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

    it('identifies dynamic chunk failures from event.message or later exception values', () => {
      expect(
        isChunkLoadError({
          message: 'Failed to fetch dynamically imported module: https://r34.app/_nuxt/chunk.js'
        })
      ).toBe(true)

      expect(
        isChunkLoadError({
          exception: {
            values: [
              { value: 'WrapperError: failed to load route', type: 'Error' },
              {
                value: 'Failed to fetch dynamically imported module: https://r34.app/_nuxt/chunk.js',
                type: 'TypeError'
              }
            ]
          }
        })
      ).toBe(true)

      expect(
        isChunkLoadError({
          exception: {
            values: [{ value: 'Unknown', type: 'ChunkLoadError: loading chunk 42 failed' }]
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

  describe('fluid-player-options', () => {
    it('shows a pause roll every 2nd video and a pre-roll from the 6th, every 3rd', () => {
      const rolls = (videosRendered: number) => getVideoAdList(videosRendered).map((ad) => ad.roll)

      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map(rolls)).toEqual([
        [],
        ['onPauseRoll'],
        [],
        ['onPauseRoll'],
        [],
        ['onPauseRoll', 'preRoll'],
        [],
        ['onPauseRoll'],
        ['preRoll'],
        ['onPauseRoll', 'preRoll']
      ])
    })

    it('builds options with the context menu links and the empty-VAST hook', () => {
      const onEmptyVast = vi.fn()
      const adList = getVideoAdList(2)

      const options = buildFluidPlayerOptions({
        adList,
        adText: 'Advertisement',
        removeAdsLabel: 'Remove ads',
        removeAdsHref: '/premium',
        downloadLabel: 'Download',
        downloadHref: 'https://example.local/video.mp4',
        onEmptyVast
      })

      expect(options.layoutControls?.contextMenu?.links).toEqual([
        { label: 'Remove ads', href: '/premium' },
        { label: 'Download', href: 'https://example.local/video.mp4' }
      ])
      expect(options.vastOptions?.adList).toBe(adList)
      options.vastOptions?.vastAdvanced?.vastVideoEndedCallback?.()
      expect(onEmptyVast).toHaveBeenCalledOnce()
    })
  })
})
