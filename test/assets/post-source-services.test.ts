import { describe, expect, it } from 'vitest'
import {
  buildAnimeRelatedSourceServices,
  buildImageRelatedSourceServices,
  type PostSourceService
} from '../../app/assets/js/post-source-services'

const postFileUrl = 'https://static.example.org/samples/image.jpg'

function findService(services: readonly PostSourceService[], serviceName: string) {
  return services.find((service) => service.serviceName === serviceName)
}

describe('post source services', () => {
  it('builds every anime related service from the post file url', () => {
    const services = buildAnimeRelatedSourceServices(postFileUrl)

    expect(services.map((service) => service.serviceName)).toEqual(['SauceNAO', 'ASCII2D', 'IQDB'])

    for (const service of services) {
      expect(service.action).toBe('find')
      expect(service.link).toContain(encodeURIComponent(postFileUrl))
      expect(URL.parse(service.link)).toBeTruthy()
    }
  })

  it('builds every image related service from the post file url', () => {
    const services = buildImageRelatedSourceServices(postFileUrl)

    expect(services.map((service) => service.serviceName)).toEqual(['Google', 'Yandex', 'Bing', 'TinEye', 'ImgOps'])

    for (const service of services.filter((service) => service.serviceName !== 'ImgOps')) {
      expect(service.link).toContain(encodeURIComponent(postFileUrl))
      expect(URL.parse(service.link)).toBeTruthy()
    }
  })

  it('searches Yandex with the reverse image search mode', () => {
    const yandex = findService(buildImageRelatedSourceServices(postFileUrl), 'Yandex')

    expect(yandex?.link).toBe(`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(postFileUrl)}`)
  })

  it('passes the file url to the other general searches', () => {
    const services = buildImageRelatedSourceServices(postFileUrl)
    const encodedFileUrl = encodeURIComponent(postFileUrl)

    expect(findService(services, 'Google')?.link).toBe(`https://lens.google.com/uploadbyurl?url=${encodedFileUrl}`)
    expect(findService(services, 'Bing')?.link).toBe(
      `https://www.bing.com/images/searchbyimage?cbir=sbi&imgurl=${encodedFileUrl}`
    )
    expect(findService(services, 'TinEye')?.link).toBe(`https://tineye.com/search/?url=${encodedFileUrl}`)
  })

  it('drops the scheme for ImgOps', () => {
    const imgOps = findService(buildImageRelatedSourceServices(postFileUrl), 'ImgOps')

    expect(imgOps?.action).toBe('edit')
    expect(imgOps?.link).toBe('https://imgops.com/static.example.org/samples/image.jpg')
  })
})
