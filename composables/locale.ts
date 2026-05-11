import { hasProtocol } from 'ufo'
import { localeCodes } from '~/config/i18n'

export function stripLocaleFromPath(path: string) {
  const url = new URL(path, 'https://example.com')
  const segments = url.pathname.split('/').filter(Boolean)

  if (!localeCodes.has(segments[0])) return path

  url.pathname = '/' + segments.slice(1).join('/')
  return url.pathname + url.search + url.hash
}

export function isExternalHref(href: string) {
  return hasProtocol(href, { acceptRelative: true })
}
