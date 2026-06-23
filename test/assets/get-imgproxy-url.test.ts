import { describe, expect, it } from 'vitest'
import { getImgproxyUrl } from '../../app/assets/js/nuxt-image/get-imgproxy-url'

function decodeImgproxySource(url: string) {
  const parsedUrl = URL.parse(url)

  if (!parsedUrl) {
    throw new Error(`Invalid imgproxy URL: ${url}`)
  }

  const encodedSource = parsedUrl.pathname.split('/').at(-1)

  if (!encodedSource) {
    throw new Error('Missing encoded imgproxy source')
  }

  const padded = encodedSource.padEnd(Math.ceil(encodedSource.length / 4) * 4, '=')
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

describe('getImgproxyUrl', () => {
  it('returns an imgproxy URL that fetches through the internal nginx proxy', () => {
    const sourceUrl = 'https://example.local/thumbnails/998/thumbnail_998.jpg'

    const proxiedUrl = getImgproxyUrl(sourceUrl)

    expect(proxiedUrl.startsWith('https://imgproxy2.r34.app/')).toBe(true)
    expect(decodeImgproxySource(proxiedUrl)).toBe(`http://nginx-proxy/proxy?url=${sourceUrl}`)
  })
})
