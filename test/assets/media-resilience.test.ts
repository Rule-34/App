import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BREAKER_COOLDOWN_MS,
  getCandidateSources,
  isDomainDirectBlocked,
  recordDirectFailure,
  recordDirectSuccess,
  resetDomainBreaker,
  resetDomainHealth,
  onDomainHealthChange,
  toDdgUrl,
  toPhotonUrl
} from '../../app/assets/js/media-resilience'

vi.mock('~~/config/project', () => import('../../config/project'))

describe('media-resilience', () => {
  beforeEach(() => {
    resetDomainHealth()
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
  })

  describe('getCandidateSources', () => {
    const imgUrl = 'https://static1.e621.net/data/sample/123.jpg'
    const videoUrl = 'https://static1.e621.net/data/video/123.mp4'

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

    it('appends premium proxy to image candidates for premium users', () => {
      const candidates = getCandidateSources({
        rawUrl: imgUrl,
        mediaType: 'image',
        isPremium: true
      })

      expect(candidates).toHaveLength(4)
      expect(candidates[0]).toBe(imgUrl)
      expect(candidates[1]).toBe(toPhotonUrl(imgUrl))
      expect(candidates[2]).toContain('external-content.duckduckgo.com')
      expect(candidates[3]).toContain('/api/cors-proxy/?')
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

    it('skips photon candidate if url contains query parameters', () => {
      const queryImg = 'https://cdn.donmai.us/original/12/34/1234.png?token=secret'
      const candidates = getCandidateSources({
        rawUrl: queryImg,
        mediaType: 'image',
        isPremium: false
      })

      expect(candidates.some((c) => c.includes('wp.com'))).toBe(false)
      expect(candidates[0]).toBe(queryImg)
      expect(candidates[1]).toContain('external-content.duckduckgo.com')
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
})
