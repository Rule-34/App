import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
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
      expect(output).toBe(
        'https://i0.wp.com/static1.e621.net/data/preview/94/91/9491498441879ff4168532af1d23ddfc.jpg?ssl=1'
      )
    })

    it('preserves existing query parameters when adding ssl=1', () => {
      const input = 'https://cdn.donmai.us/original/12/34/1234.png?download=true'
      const output = toPhotonUrl(input)
      expect(output).toContain('https://i0.wp.com/cdn.donmai.us/original/12/34/1234.png?')
      expect(output).toContain('download=true')
      expect(output).toContain('ssl=1')
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
      expect(candidates[1]).toContain('i0.wp.com')
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
      expect(candidates[1]).toContain('i0.wp.com')
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
      expect(candidates[1]).toContain('i0.wp.com')
      expect(candidates[2]).toContain('external-content.duckduckgo.com')
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

    it('only notifies on recordDirectSuccess when there was an active failure or block', () => {
      let notifyCount = 0
      const unsubscribe = onDomainHealthChange(() => {
        notifyCount += 1
      })

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

      unsubscribe()
    })
  })
})
