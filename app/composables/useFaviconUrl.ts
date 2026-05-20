export function useFaviconUrl(urlOrDomain: string, size = 64) {
  const normalizedUrl = /^[a-z][a-z\d+\-.]*:\/\//i.test(urlOrDomain) ? urlOrDomain : `https://${urlOrDomain}`
  const url = URL.parse(normalizedUrl)
  const domain = url?.hostname ?? urlOrDomain

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
}
