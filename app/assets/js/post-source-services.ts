export type PostSourceServiceAction = 'find' | 'edit'

export type PostSourceService = {
  serviceName: string
  action: PostSourceServiceAction
  link: string
}

/**
 * Anime and art focused reverse image searches
 */
export function buildAnimeRelatedSourceServices(postFileUrl: string): PostSourceService[] {
  const encodedFileUrl = encodeURIComponent(postFileUrl)

  return [
    {
      serviceName: 'SauceNAO',
      action: 'find',
      link: `https://saucenao.com/search.php?url=${encodedFileUrl}`
    },
    {
      serviceName: 'ASCII2D',
      action: 'find',
      link: `https://ascii2d.net/search/url/${encodedFileUrl}`
    },
    {
      serviceName: 'IQDB',
      action: 'find',
      link: `https://iqdb.org/?url=${encodedFileUrl}`
    }
  ]
}

/**
 * General reverse image searches
 *
 * Yandex only runs a reverse image search when the `rpt=imageview` mode is requested, a plain
 * `?url=` is served as a regular (empty) text search.
 */
export function buildImageRelatedSourceServices(postFileUrl: string): PostSourceService[] {
  const encodedFileUrl = encodeURIComponent(postFileUrl)

  return [
    {
      serviceName: 'Google',
      action: 'find',
      link: `https://lens.google.com/uploadbyurl?url=${encodedFileUrl}`
    },
    {
      serviceName: 'Yandex',
      action: 'find',
      link: `https://yandex.com/images/search?rpt=imageview&url=${encodedFileUrl}`
    },
    {
      serviceName: 'Bing',
      action: 'find',
      link: `https://www.bing.com/images/searchbyimage?cbir=sbi&imgurl=${encodedFileUrl}`
    },
    {
      serviceName: 'TinEye',
      action: 'find',
      link: `https://tineye.com/search/?url=${encodedFileUrl}`
    },
    {
      serviceName: 'ImgOps',
      action: 'edit',
      link: `https://imgops.com/${postFileUrl.replace(/^https?:\/\//, '')}`
    }
  ]
}
