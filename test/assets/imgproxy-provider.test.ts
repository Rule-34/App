import { describe, expect, it } from 'vitest'
import imgproxyProvider from '../../app/assets/js/nuxt-image/imgproxy.provider'

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

describe('imgproxy provider', () => {
  const providerOptions = {
    baseUrl: 'https://imgproxy2.r34.app',
    internalProxyUrl: 'http://nginx-proxy/proxy?url=',
    mediaProxyUrls: ['https://cors-proxy2.rule34.workers.dev/', 'https://cors-proxy.refinedsoftware00.workers.dev/'],
    modifiers: {
      format: 'webp',
      width: 320
    }
  }

  it('routes Gelbooru media through the configured outbound media proxies before imgproxy fetches it', () => {
    const sourceUrl = 'https://img2.gelbooru.com/images/fb/59/fb593a551b9f89548b9a4b47f4c3bac4.png'

    const image = imgproxyProvider().getImage(sourceUrl, providerOptions)

    expect(decodeImgproxySource(image.url)).toBe(
      'https://cors-proxy2.rule34.workers.dev/?q=https%3A%2F%2Fimg2.gelbooru.com%2Fimages%2Ffb%2F59%2Ffb593a551b9f89548b9a4b47f4c3bac4.png'
    )
  })

  it('keeps non-Gelbooru media on the internal nginx proxy', () => {
    const sourceUrl = 'https://api-cdn.rule34.xxx/images/1234/example.png'

    const image = imgproxyProvider().getImage(sourceUrl, providerOptions)

    expect(decodeImgproxySource(image.url)).toBe(
      'http://nginx-proxy/proxy?url=https://api-cdn.rule34.xxx/images/1234/example.png'
    )
  })

  it('chooses the same outbound media proxy for the same source URL', () => {
    const sourceUrl = 'https://img2.gelbooru.com/images/aa/bb/example.png'

    const firstImage = imgproxyProvider().getImage(sourceUrl, providerOptions)
    const secondImage = imgproxyProvider().getImage(sourceUrl, providerOptions)

    expect(decodeImgproxySource(secondImage.url)).toBe(decodeImgproxySource(firstImage.url))
    expect(decodeImgproxySource(firstImage.url)).toBe(
      'https://cors-proxy.refinedsoftware00.workers.dev/?q=https%3A%2F%2Fimg2.gelbooru.com%2Fimages%2Faa%2Fbb%2Fexample.png'
    )
  })
})
