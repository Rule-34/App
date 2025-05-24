import { project } from '@/config/project'

export function proxyUrl(url: string, downloadName?: string) {
  const proxyUrl = new URL(`${project.urls.production.toString()}api/cors-proxy/`)

  if (downloadName) {
    proxyUrl.searchParams.set('download', downloadName)
  }

  proxyUrl.searchParams.set('q', url)

  return proxyUrl.toString()
}
