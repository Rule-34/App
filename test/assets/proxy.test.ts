import { beforeAll, describe, expect, it, vi } from 'vitest'
import { project } from '../../config/project'

vi.mock('~~/config/project', () => import('../../config/project'))

let proxyUrl: typeof import('../../app/assets/js/proxy').proxyUrl

beforeAll(async () => {
  ;({ proxyUrl } = await import('../../app/assets/js/proxy'))
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
