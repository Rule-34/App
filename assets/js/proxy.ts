import { project } from '../../config/project'

export function proxyUrl(url: string, downloadName?: string) {
  const proxyUrl = new URL('/api/cors-proxy/', project.urls.production)

  if (downloadName) {
    proxyUrl.searchParams.set('download', downloadName)
  }

  proxyUrl.searchParams.set('q', url)

  return proxyUrl.toString()
}
