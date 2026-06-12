import { joinURL } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'
import { createOperationsGenerator, defineProvider } from '@nuxt/image/runtime'

// https://docs.imgproxy.net/
const operationsGenerator = createOperationsGenerator({
  keyMap: {
    resize: 'rs',
    size: 's',
    fit: 'rt',
    width: 'w',
    height: 'h',
    dpr: 'dpr',
    enlarge: 'el',
    extend: 'ex',
    gravity: 'g',
    crop: 'c',
    padding: 'pd',
    trim: 't',
    rotate: 'rot',
    quality: 'q',
    maxBytes: 'mb',
    background: 'bg',
    backgroundAlpha: 'bga',
    blur: 'bl',
    sharpen: 'sh',
    watermark: 'wm',
    preset: 'pr',
    cacheBuster: 'cb',
    stripMetadata: 'sm',
    stripColorProfile: 'scp',
    autoRotate: 'ar',
    filename: 'fn',
    format: 'f'
  },
  formatter: (key: string, value: string | number) => `${key}:${value}`
})

function urlSafeBase64(string: string) {
  const bytes = new TextEncoder().encode(string)
  const binaryString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')

  return btoa(binaryString).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

const defaultModifiers = {
  // fit: "fill",
  // width: 0,
  // height: 0,
  // gravity: "no",
  // enlarge: 1,
  // format: "webp",
}

interface ImgproxyProviderOptions {
  baseUrl: string
  internalProxyUrl: string
  mediaProxyUrls?: string[]
}

const gelbooruHostSuffix = 'gelbooru.com'

function isGelbooruMediaSource(sourceUrl: URL) {
  return sourceUrl.hostname === gelbooruHostSuffix || sourceUrl.hostname.endsWith(`.${gelbooruHostSuffix}`)
}

function stableIndex(value: string, length: number) {
  let hash = 0

  for (const char of value) {
    hash = (hash + char.charCodeAt(0)) >>> 0
  }

  return hash % length
}

function getMediaProxySourceUrl(src: string, mediaProxyUrls: string[] | undefined) {
  if (!mediaProxyUrls?.length) {
    return
  }

  const selectedProxyUrl = mediaProxyUrls[stableIndex(src, mediaProxyUrls.length)]

  if (!selectedProxyUrl) {
    return
  }

  const proxyUrl = URL.parse(selectedProxyUrl)

  if (!proxyUrl) {
    return
  }

  proxyUrl.searchParams.set('q', src)

  return proxyUrl.toString()
}

/**
 *
 * @see https://github.com/nuxt/image/issues/378
 */
const getImage: ProviderGetImage<ImgproxyProviderOptions> = (src, options) => {
  // Skip if src is not an absolute HTTP(S) URL.
  if (!URL.canParse(src)) {
    return { url: src }
  }

  const sourceUrl = new URL(src)

  if (sourceUrl.protocol !== 'http:' && sourceUrl.protocol !== 'https:') {
    return { url: src }
  }

  // Skip GIFs, since imgproxy doesn't support them.
  if (sourceUrl.pathname.endsWith('.gif')) {
    return { url: src }
  }

  const { modifiers, baseUrl, internalProxyUrl, mediaProxyUrls } = options

  const mergeModifiers = { ...defaultModifiers, ...modifiers }

  // Remove dimensions from imgproxy operations so the same source reuses a common cached URL.
  const { width, height, ...modifiersWithoutSize } = mergeModifiers

  const mediaProxySourceUrl = isGelbooruMediaSource(sourceUrl) ? getMediaProxySourceUrl(src, mediaProxyUrls) : undefined

  // Build rewriter URL: nginx-proxy fetches the source and strips headers.
  // Gelbooru media is fetched through Cloudflare Workers first because Gelbooru rate-limits the VM egress IP.
  const rewriterUrl = mediaProxySourceUrl ?? `${internalProxyUrl}${src}`
  const encodedUrl = urlSafeBase64(rewriterUrl)

  const path = joinURL('/insecure', operationsGenerator(modifiersWithoutSize), encodedUrl)

  return {
    url: joinURL(baseUrl, path)
  }
}

export default defineProvider({
  getImage
})
