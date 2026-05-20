import { hasProtocol } from 'ufo'
import { localeCodes } from '~~/config/i18n'

export function stripLocaleFromPath(path: string) {
  const url = URL.parse(path, 'https://example.com')

  if (!url) return path

  const segments = url.pathname.split('/').filter(Boolean)
  const locale = segments[0]

  if (!locale || !localeCodes.has(locale)) return path

  url.pathname = '/' + segments.slice(1).join('/')
  return url.pathname + url.search + url.hash
}

export function isExternalHref(href: string) {
  return hasProtocol(href, { acceptRelative: true })
}
