import { project } from '../../../../config/project'
import imgproxyProvider from './imgproxy.provider'

export function getImgproxyUrl(src: string) {
  const { url } = imgproxyProvider().getImage(src, {
    baseUrl: project.imgproxy.baseUrl,
    internalProxyUrl: project.imgproxy.internalProxyUrl,
    mediaProxyUrls: project.imgproxy.mediaProxyUrls
  })

  return url
}
