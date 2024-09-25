export function proxyUrl(url: string, downloadName?: string) {
  const proxyUrl = new URL('https://r34.app/api/cors-proxy/')

  if (downloadName) {
    proxyUrl.searchParams.set('download', downloadName)
  }

  proxyUrl.searchParams.set('q', url)

  return proxyUrl.toString()
}
