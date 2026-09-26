import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BREAKER_COOLDOWN_MS,
  cleanMediaUrl,
  getCandidateSources,
  getMediaReferrerPolicy,
  hasSensitiveCredentialsOrTokens,
  isDomainDirectBlocked,
  recordDirectFailure,
  recordDirectSuccess,
  resetDomainBreaker,
  resetDomainHealth,
  onDomainHealthChange,
  pauseVideoPlayback,
  registerVideoPlayback,
  resetVideoCoordinator,
  toDdgUrl,
  toPhotonUrl
} from '../../app/assets/js/media-resilience'

vi.mock('~~/config/project', () => import('../../config/project'))

describe('media-resilience', () => {
  beforeEach(() => {
    resetDomainHealth()
  })

  describe('cleanMediaUrl', () => {
    it('returns null for null, undefined, empty, or whitespace-only values', () => {
      expect(cleanMediaUrl(null)).toBeNull()
      expect(cleanMediaUrl(undefined)).toBeNull()
      expect(cleanMediaUrl('')).toBeNull()
      expect(cleanMediaUrl('   ')).toBeNull()
    })

    it('returns null for non-HTTP(S) or malicious URL schemes', () => {
      expect(cleanMediaUrl('javascript:alert(1)')).toBeNull()
      expect(cleanMediaUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull()
      expect(cleanMediaUrl('file:///etc/passwd')).toBeNull()
      expect(cleanMediaUrl('ftp://example.com/file.jpg')).toBeNull()
    })

    it('returns null for malformed URLs', () => {
      expect(cleanMediaUrl('http://')).toBeNull()
      expect(cleanMediaUrl('not-a-valid-url')).toBeNull()
    })

    it('strips URI fragments while preserving valid HTTP/HTTPS URLs', () => {
      expect(cleanMediaUrl('https://example.com/image.jpg#section')).toBe('https://example.com/image.jpg')
      expect(cleanMediaUrl('http://example.com/video.mp4#t=10')).toBe('http://example.com/video.mp4')
    })

    it('trims outer whitespace from valid URLs', () => {
      expect(cleanMediaUrl('  https://example.com/image.jpg  ')).toBe('https://example.com/image.jpg')
    })

    it('preserves valid root-relative paths for first-party assets while rejecting protocol-relative and malicious variants', () => {
      expect(cleanMediaUrl('/img/promo/HentaiPorn.jpg')).toBe('/img/promo/HentaiPorn.jpg')
      expect(cleanMediaUrl('/img/promo/premium/No Ads.jpg')).toBe('/img/promo/premium/No%20Ads.jpg')
      expect(cleanMediaUrl('/img/promo/HentaiPorn.jpg#fragment')).toBe('/img/promo/HentaiPorn.jpg')
      expect(cleanMediaUrl('//evil.com/image.jpg')).toBeNull()
      expect(cleanMediaUrl('/\\evil.com/image.jpg')).toBeNull()
    })
  })

  describe('toPhotonUrl', () => {
    it('creates a safe photon url with ssl=1 for https urls', () => {
      const input = 'https://static1.e621.net/data/preview/94/91/9491498441879ff4168532af1d23ddfc.jpg'
      const output = toPhotonUrl(input)
      expect(output).toMatch(
        /^https:\/\/i[0-3]\.wp\.com\/static1\.e621\.net\/data\/preview\/94\/91\/9491498441879ff4168532af1d23ddfc\.jpg\?ssl=1$/
      )
    })

    it('returns rawUrl for urls with query parameters or non-default ports', () => {
      const queryInput = 'https://cdn.donmai.us/original/12/34/1234.png?download=true'
      expect(toPhotonUrl(queryInput)).toBe(queryInput)

      const portInput = 'https://cdn.donmai.us:8443/original/12/34/1234.png'
      expect(toPhotonUrl(portInput)).toBe(portInput)
    })
  })

  describe('hasSensitiveCredentialsOrTokens', () => {
    it('detects embedded user credentials in URL', () => {
      expect(hasSensitiveCredentialsOrTokens('https://user:pass@cdn.example.com/image.jpg')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg')).toBe(false)
    })

    it('detects sensitive and signed auth parameters', () => {
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?token=abc')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?password=secret')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?pass=secret')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?pwd=secret')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?X-Amz-Signature=xyz')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?sig=xyz')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?apiKey=xyz')).toBe(true)
      expect(hasSensitiveCredentialsOrTokens('https://cdn.example.com/image.jpg?download=true&v=1')).toBe(false)
    })
  })

  describe('getMediaReferrerPolicy', () => {
    it('returns no-referrer for empty, whitespace, null, or invalid URLs', () => {
      expect(getMediaReferrerPolicy(undefined)).toBe('no-referrer')
      expect(getMediaReferrerPolicy(null)).toBe('no-referrer')
      expect(getMediaReferrerPolicy('')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('   ')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('not a url')).toBe('no-referrer')
    })

    it('returns strict-origin-when-cross-origin for relative paths and internal endpoints', () => {
      expect(getMediaReferrerPolicy('/imgproxy/xyz')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('./img/featured/tag.jpg')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('../assets/image.png')).toBe('strict-origin-when-cross-origin')
    })

    it('returns origin for e621, e926, and e6ai CDN hosts', () => {
      expect(getMediaReferrerPolicy('https://static1.e621.net/data/sample/123.jpg')).toBe('origin')
      expect(getMediaReferrerPolicy('https://e621.net/data/sample/123.jpg')).toBe('origin')
      expect(getMediaReferrerPolicy('https://static1.e926.net/data/sample/123.jpg')).toBe('origin')
      expect(getMediaReferrerPolicy('https://e926.net/data/sample/123.jpg')).toBe('origin')
      expect(getMediaReferrerPolicy('https://static1.e6ai.net/data/sample/123.jpg')).toBe('origin')
      expect(getMediaReferrerPolicy('https://e6ai.net/data/sample/123.jpg')).toBe('origin')
    })

    it('returns strict-origin-when-cross-origin for first-party, development, and tailscale hosts', () => {
      expect(getMediaReferrerPolicy('https://r34.app/img/featured.jpg')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('https://images.r34.app/preview.webp')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('https://akbal.dev/test.png')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('https://cdn.akbal.dev/test.png')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('http://localhost:3000/img.jpg')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('http://127.0.0.1:3000/img.jpg')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('http://metal-mac-mini:3000/img.jpg')).toBe('strict-origin-when-cross-origin')
      expect(getMediaReferrerPolicy('http://100.88.191.18:3000/img.jpg')).toBe('strict-origin-when-cross-origin')
    })

    it('returns no-referrer for third-party boorus and fallback proxies to avoid hotlink blocks', () => {
      expect(getMediaReferrerPolicy('https://cdn.donmai.us/original/12/34/1234.png')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('https://img3.gelbooru.com/images/12/34/1234.jpg')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('https://rule34.paheal.net/_images/123.jpg')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('https://api-cdn.rule34.xxx/images/123.jpg')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('https://i0.wp.com/cdn.donmai.us/image.jpg')).toBe('no-referrer')
      expect(getMediaReferrerPolicy('https://external-content.duckduckgo.com/iu/?u=xyz')).toBe('no-referrer')
    })
  })

  describe('toDdgUrl', () => {
    it('creates a valid duckduckgo image proxy url with nofb=1', () => {
      const input = 'https://static1.e621.net/data/sample/123.jpg'
      const output = toDdgUrl(input)
      const parsed = new URL(output)
      expect(parsed.origin).toBe('https://external-content.duckduckgo.com')
      expect(parsed.pathname).toBe('/iu/')
      expect(parsed.searchParams.get('u')).toBe(input)
      expect(parsed.searchParams.get('f')).toBe('1')
      expect(parsed.searchParams.get('nofb')).toBe('1')
    })

    it('returns rawUrl unchanged for credential-bearing or signed URLs', () => {
      const sensitiveToken = 'https://cdn.example.com/image.jpg?token=secret123'
      expect(toDdgUrl(sensitiveToken)).toBe(sensitiveToken)

      const sensitiveCreds = 'https://user:pass@cdn.example.com/image.jpg'
      expect(toDdgUrl(sensitiveCreds)).toBe(sensitiveCreds)
    })
  })

  describe('getCandidateSources', () => {
    const imgUrl = 'https://static1.e621.net/data/sample/123.jpg'
    const videoUrl = 'https://static1.e621.net/data/video/123.mp4'

    it('returns empty array when rawUrl is empty, whitespace, or invalid', () => {
      expect(
        getCandidateSources({
          rawUrl: '',
          mediaType: 'image',
          isPremium: false
        })
      ).toEqual([])

      expect(
        getCandidateSources({
          rawUrl: '   ',
          mediaType: 'image',
          isPremium: false
        })
      ).toEqual([])

      expect(
        getCandidateSources({
          rawUrl: 'javascript:alert(1)',
          mediaType: 'image',
          isPremium: false
        })
      ).toEqual([])
    })

    it('strips fragment identifiers from rawUrl when building candidates', () => {
      const candidates = getCandidateSources({
        rawUrl: `${imgUrl}#frag`,
        mediaType: 'image',
        isPremium: false
      })

      expect(candidates[0]).toBe(imgUrl)
      expect(candidates[0]).not.toContain('#frag')
    })

    it('returns direct, photon, and ddg for non-premium image', () => {
      const candidates = getCandidateSources({
        rawUrl: imgUrl,
        mediaType: 'image',
        isPremium: false
      })

      expect(candidates).toHaveLength(3)
      expect(candidates[0]).toBe(imgUrl)
      expect(candidates[1]).toBe(toPhotonUrl(imgUrl))
      expect(candidates[2]).toContain('external-content.duckduckgo.com')
    })

    it('routes premium images through direct origin and premium proxy without public CDNs', () => {
      const candidates = getCandidateSources({
        rawUrl: imgUrl,
        mediaType: 'image',
        isPremium: true
      })

      expect(candidates).toHaveLength(2)
      expect(candidates[0]).toBe(imgUrl)
      expect(candidates[1]).toContain('/api/cors-proxy/?')
      // Premium users should not be degraded to public image CDNs
      expect(candidates.some((c) => c.includes('wordpress.com'))).toBe(false)
      expect(candidates.some((c) => c.includes('duckduckgo.com'))).toBe(false)
    })

    it('returns only the direct candidate for root-relative internal assets without external proxy chains', () => {
      const candidates = getCandidateSources({
        rawUrl: '/img/promo/HentaiPorn.jpg',
        mediaType: 'image',
        isPremium: false
      })

      expect(candidates).toEqual(['/img/promo/HentaiPorn.jpg'])

      const premiumCandidates = getCandidateSources({
        rawUrl: '/img/promo/HentaiPorn.jpg',
        mediaType: 'image',
        isPremium: true
      })

      expect(premiumCandidates).toEqual(['/img/promo/HentaiPorn.jpg'])
    })

    it('returns only direct for non-premium video (public proxies excluded)', () => {
      const candidates = getCandidateSources({
        rawUrl: videoUrl,
        mediaType: 'video',
        isPremium: false
      })

      expect(candidates).toHaveLength(1)
      expect(candidates[0]).toBe(videoUrl)
    })

    it('appends premium proxy for premium video', () => {
      const candidates = getCandidateSources({
        rawUrl: videoUrl,
        mediaType: 'video',
        isPremium: true
      })

      expect(candidates).toHaveLength(2)
      expect(candidates[0]).toBe(videoUrl)
      expect(candidates[1]).toContain('/api/cors-proxy/?')
    })

    it('returns stable ordered candidates [direct, photon, ddg] for non-premium image', () => {
      const candidates = getCandidateSources({
        rawUrl: imgUrl,
        mediaType: 'image',
        isPremium: false
      })

      expect(candidates).toHaveLength(3)
      expect(candidates[0]).toBe(imgUrl)
      expect(candidates[1]).toBe(toPhotonUrl(imgUrl))
      expect(candidates[2]).toContain('external-content.duckduckgo.com')
    })

    it('skips photon candidate if url contains query parameters, but allows ddg for safe query params', () => {
      const queryImg = 'https://cdn.donmai.us/original/12/34/1234.png?download=true'
      const candidates = getCandidateSources({
        rawUrl: queryImg,
        mediaType: 'image',
        isPremium: false
      })

      expect(candidates.some((c) => c.includes('wp.com'))).toBe(false)
      expect(candidates[0]).toBe(queryImg)
      expect(candidates[1]).toContain('external-content.duckduckgo.com')
    })

    it('skips public fallback proxies if url contains sensitive credentials or tokens', () => {
      const sensitiveImg = 'https://cdn.donmai.us/original/12/34/1234.png?token=secret123'
      const candidates = getCandidateSources({
        rawUrl: sensitiveImg,
        mediaType: 'image',
        isPremium: false
      })

      // Both Photon (query) and DDG (sensitive token) must be excluded
      expect(candidates).toEqual([sensitiveImg])

      const passwordImg = 'https://cdn.donmai.us/original/12/34/1234.png?password=secret'
      const passwordCandidates = getCandidateSources({
        rawUrl: passwordImg,
        mediaType: 'image',
        isPremium: false
      })
      expect(passwordCandidates).toEqual([passwordImg])
    })
  })

  describe('domain circuit breaker', () => {
    const url = 'https://static1.e621.net/data/preview/sample.jpg'

    it('starts unblocked', () => {
      expect(isDomainDirectBlocked(url, 'image')).toBe(false)
    })

    it('trips after 3 consecutive failures', () => {
      recordDirectFailure(url, 'image')
      expect(isDomainDirectBlocked(url, 'image')).toBe(false)

      recordDirectFailure(url, 'image')
      expect(isDomainDirectBlocked(url, 'image')).toBe(false)

      recordDirectFailure(url, 'image')
      expect(isDomainDirectBlocked(url, 'image')).toBe(true)
    })

    it('resets failure count on success before tripping', () => {
      recordDirectFailure(url, 'image')
      recordDirectFailure(url, 'image')
      recordDirectSuccess(url, 'image')

      recordDirectFailure(url, 'image')
      expect(isDomainDirectBlocked(url, 'image')).toBe(false)
    })

    it('keeps image and video domain breakers isolated', () => {
      recordDirectFailure(url, 'image')
      recordDirectFailure(url, 'image')
      recordDirectFailure(url, 'image')

      expect(isDomainDirectBlocked(url, 'image')).toBe(true)
      expect(isDomainDirectBlocked(url, 'video')).toBe(false)
    })
    it('resets a tripped breaker via resetDomainBreaker', () => {
      recordDirectFailure(url, 'image')
      recordDirectFailure(url, 'image')
      recordDirectFailure(url, 'image')
      expect(isDomainDirectBlocked(url, 'image')).toBe(true)

      resetDomainBreaker(url, 'image')
      expect(isDomainDirectBlocked(url, 'image')).toBe(false)
    })

    it('handles half-open probe correctly after cooldown expires', () => {
      vi.useFakeTimers()
      try {
        const testUrl = 'https://wimg.rule34.xxx/posts/123/video.mp4'
        resetDomainBreaker(testUrl, 'video')

        // 3 failures trip the breaker
        recordDirectFailure(testUrl, 'video')
        recordDirectFailure(testUrl, 'video')
        recordDirectFailure(testUrl, 'video')
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(true)

        // Advance time past cooldown
        vi.advanceTimersByTime(BREAKER_COOLDOWN_MS + 1)
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(false)

        // Probe failure after cooldown should NOT immediately re-trip the breaker (failure count was reset)
        recordDirectFailure(testUrl, 'video')
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(false)

        // 2 more consecutive failures should re-trip the breaker
        recordDirectFailure(testUrl, 'video')
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(false)
        recordDirectFailure(testUrl, 'video')
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(true)
      } finally {
        resetDomainHealth()
        vi.useRealTimers()
      }
    })

    it('decays stale sub-threshold failures older than the cooldown window', () => {
      vi.useFakeTimers()
      try {
        const testUrl = 'https://wimg.rule34.xxx/posts/123/image.jpg'
        resetDomainBreaker(testUrl, 'image')

        // 2 failures (below threshold of 3)
        recordDirectFailure(testUrl, 'image')
        recordDirectFailure(testUrl, 'image')
        expect(isDomainDirectBlocked(testUrl, 'image')).toBe(false)

        // Advance time past the cooldown decay window
        vi.advanceTimersByTime(BREAKER_COOLDOWN_MS + 1)

        // A single new failure should decay previous failures to 0 and not trip the breaker
        recordDirectFailure(testUrl, 'image')
        expect(isDomainDirectBlocked(testUrl, 'image')).toBe(false)

        // Only after 2 more failures within the window should it trip
        recordDirectFailure(testUrl, 'image')
        expect(isDomainDirectBlocked(testUrl, 'image')).toBe(false)
        recordDirectFailure(testUrl, 'image')
        expect(isDomainDirectBlocked(testUrl, 'image')).toBe(true)
      } finally {
        resetDomainHealth()
        vi.useRealTimers()
      }
    })

    it('does not extend cooldown when late failures arrive while breaker is already open', () => {
      vi.useFakeTimers()
      try {
        const testUrl = 'https://wimg.rule34.xxx/posts/123/video.mp4'
        resetDomainBreaker(testUrl, 'video')

        // Trip the breaker
        recordDirectFailure(testUrl, 'video')
        recordDirectFailure(testUrl, 'video')
        recordDirectFailure(testUrl, 'video')
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(true)

        // Advance half-way through cooldown
        vi.advanceTimersByTime(BREAKER_COOLDOWN_MS / 2)

        // Late arriving failure should be ignored and NOT push cooldown back by another full cycle
        recordDirectFailure(testUrl, 'video')

        // Advance the remaining half + 1ms (total BREAKER_COOLDOWN_MS + 1)
        vi.advanceTimersByTime(BREAKER_COOLDOWN_MS / 2 + 1)

        // Breaker should now be closed / half-open, not still blocked
        expect(isDomainDirectBlocked(testUrl, 'video')).toBe(false)
      } finally {
        resetDomainHealth()
        vi.useRealTimers()
      }
    })

    it('only notifies on recordDirectSuccess when there was an active failure or block', () => {
      let notifyCount = 0
      const unsubscribe = onDomainHealthChange(() => {
        notifyCount += 1
      })

      try {
        // Success on pristine domain should NOT notify
        recordDirectSuccess(url, 'image')
        expect(notifyCount).toBe(0)

        // Record a failure -> notifies (1)
        recordDirectFailure(url, 'image')
        expect(notifyCount).toBe(1)

        // Success on domain with failure count -> notifies and resets (2)
        recordDirectSuccess(url, 'image')
        expect(notifyCount).toBe(2)

        // Another success on now-healthy domain -> does NOT notify
        recordDirectSuccess(url, 'image')
        expect(notifyCount).toBe(2)
      } finally {
        unsubscribe()
      }
    })
  })

  describe('video playback coordination', () => {
    type EventCallback = (event: unknown) => void
    interface MockDocument {
      addEventListener: (event: string, listener: EventCallback, useCapture?: boolean) => void
      removeEventListener: (event: string, listener: EventCallback, useCapture?: boolean) => void
      querySelectorAll: (selector: string) => Iterable<unknown>
    }
    interface GlobalWithDoc {
      document?: MockDocument
    }

    function setupMockDocument(fallbackVideos: unknown[] = []) {
      let playListener: EventCallback | null = null
      const scope = globalThis as unknown as GlobalWithDoc
      const originalDoc = scope.document
      scope.document = {
        addEventListener: vi.fn((event: string, listener: EventCallback) => {
          if (event === 'play') playListener = listener
        }),
        removeEventListener: vi.fn(),
        querySelectorAll: vi.fn((sel: string) => (sel === 'video' ? fallbackVideos : []))
      }
      return {
        getPlayListener: () => playListener,
        restore: () => {
          scope.document = originalDoc
          resetVideoCoordinator()
        }
      }
    }

    beforeEach(() => {
      resetVideoCoordinator()
    })

    it('pauses other registered videos and their player wrappers when one video plays', () => {
      const v1Pause = vi.fn()
      const p1Pause = vi.fn()
      const v2Pause = vi.fn()
      const p2Pause = vi.fn()

      const v1 = {
        tagName: 'VIDEO',
        paused: false,
        pause: v1Pause
      }
      const v2 = {
        tagName: 'VIDEO',
        paused: false,
        pause: v2Pause
      }

      const mockDoc = setupMockDocument()

      try {
        registerVideoPlayback(v1, () => ({ pause: p1Pause }))
        registerVideoPlayback(v2, () => ({ pause: p2Pause }))

        const playListener = mockDoc.getPlayListener()
        expect(playListener).not.toBeNull()

        // Simulate v2 emitting a 'play' event
        playListener!({ target: v2 })

        // v1 should have been paused, along with its player
        expect(v1Pause).toHaveBeenCalledTimes(1)
        expect(p1Pause).toHaveBeenCalledTimes(1)

        // v2 (the one that started playing) must NOT be paused
        expect(v2Pause).not.toHaveBeenCalled()
        expect(p2Pause).not.toHaveBeenCalled()
      } finally {
        mockDoc.restore()
      }
    })

    it('does not pause already paused videos or invoke player pause if paused', () => {
      const v1Pause = vi.fn()
      const p1Pause = vi.fn()

      const v1 = {
        tagName: 'VIDEO',
        paused: true,
        pause: v1Pause
      }
      const v2 = {
        tagName: 'VIDEO',
        paused: false,
        pause: vi.fn()
      }

      const mockDoc = setupMockDocument()

      try {
        registerVideoPlayback(v1, () => ({ pause: p1Pause }))
        registerVideoPlayback(v2)

        const playListener = mockDoc.getPlayListener()
        playListener!({ target: v2 })

        expect(v1Pause).not.toHaveBeenCalled()
        expect(p1Pause).not.toHaveBeenCalled()
      } finally {
        mockDoc.restore()
      }
    })

    it('cleans up registration when unregister callback is invoked', () => {
      const v1Pause = vi.fn()
      const v1 = { tagName: 'VIDEO', paused: false, pause: v1Pause }
      const v2 = { tagName: 'VIDEO', paused: false, pause: vi.fn() }

      const mockDoc = setupMockDocument()

      try {
        const unregisterV1 = registerVideoPlayback(v1)
        registerVideoPlayback(v2)

        unregisterV1()

        const playListener = mockDoc.getPlayListener()
        playListener!({ target: v2 })

        expect(v1Pause).not.toHaveBeenCalled()
      } finally {
        mockDoc.restore()
      }
    })

    it('pauses unregistered playing video elements found via document query fallback', () => {
      const vFallbackPause = vi.fn()
      const fallbackVideo = { tagName: 'VIDEO', paused: false, pause: vFallbackPause }
      const activeVideo = { tagName: 'VIDEO', paused: false, pause: vi.fn() }

      const mockDoc = setupMockDocument([fallbackVideo])

      try {
        registerVideoPlayback(activeVideo)

        const playListener = mockDoc.getPlayListener()
        playListener!({ target: activeVideo })

        expect(vFallbackPause).toHaveBeenCalledTimes(1)
      } finally {
        mockDoc.restore()
      }
    })

    it('pauseVideoPlayback handles nulls and player pause exceptions safely', () => {
      expect(() => pauseVideoPlayback(null, null)).not.toThrow()
      expect(() => pauseVideoPlayback(undefined, undefined)).not.toThrow()

      const throwingPlayer = {
        pause: vi.fn(() => {
          throw new Error('player torn down')
        })
      }
      const video = { tagName: 'VIDEO', paused: false, pause: vi.fn() }

      expect(() => pauseVideoPlayback(video, throwingPlayer)).not.toThrow()
      expect(video.pause).toHaveBeenCalledTimes(1)
    })
  })
})
