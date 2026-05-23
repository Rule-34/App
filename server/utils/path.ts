import { localeCodes } from '~~/config/i18n'

export function stripLocaleFromPath(path: string) {
  const url = new URL(path, 'https://example.com')
  const segments = url.pathname.split('/').filter(Boolean)
  const locale = segments[0]

  if (!locale || !localeCodes.has(locale)) return path

  url.pathname = '/' + segments.slice(1).join('/')
  return url.pathname + url.search + url.hash
}
