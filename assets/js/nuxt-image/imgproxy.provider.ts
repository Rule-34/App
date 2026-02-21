import { joinURL } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'
import { Buffer } from 'buffer'
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
  return Buffer.from(string, 'utf8').toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
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
}

/**
 *
 * @see https://github.com/nuxt/image/issues/378
 */
const getImage: ProviderGetImage<ImgproxyProviderOptions> = (src, options) => {
  // Skip if src is a relative URL
  if (src.startsWith('/')) {
    return { url: src }
  }

  // Skip GIFs, since imgproxy doesn't support them
  if (src.endsWith('.gif')) {
    return { url: src }
  }

  const { modifiers, baseUrl, internalProxyUrl } = options

  const mergeModifiers = { ...defaultModifiers, ...modifiers }

  // Remove width and height to generate more common URLs for better caching
  const { width, height, ...modifiersWithoutSize } = mergeModifiers

  // Build rewriter URL: nginx-proxy fetches the source and strips headers
  const rewriterUrl = `${internalProxyUrl}${src}`
  const encodedUrl = urlSafeBase64(rewriterUrl)

  const path = joinURL('/insecure', operationsGenerator(modifiersWithoutSize), encodedUrl)

  return {
    url: joinURL(baseUrl, path)
  }
}

export default defineProvider({
  getImage
})
