import { project } from '~~/config/project'

export function proxyUrl(url: string, downloadName?: string) {
  const proxyUrl = URL.parse('api/cors-proxy/', project.urls.production.href)

  if (!proxyUrl) {
    throw new Error('Invalid proxy URL')
  }

  if (downloadName) {
    proxyUrl.searchParams.set('download', downloadName)
  }

  proxyUrl.searchParams.set('q', url)

  return proxyUrl.toString()
}
