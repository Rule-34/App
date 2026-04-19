import { hasProtocol } from 'ufo'

export function useLocalizedHref() {
  function isExternalHref(href: string) {
    return hasProtocol(href, { acceptRelative: true })
  }

  return {
    isExternalHref
  }
}
