import { removedLocaleCodes } from '~~/config/i18n'

const removedLocalePrefixRe = new RegExp(`^/(${removedLocaleCodes.join('|')})(?:/|$)`)

export function buildRemovedLocaleRedirectTarget(pathname: string, search = '', hash = '') {
  if (!removedLocalePrefixRe.test(pathname)) {
    return null
  }

  const strippedPath = pathname.replace(removedLocalePrefixRe, '/').replace(/\/{2,}/g, '/')
  const targetPath = strippedPath === '/' ? '/' : strippedPath.replace(/\/$/, '') || '/'

  return `${targetPath}${search}${hash}`
}
