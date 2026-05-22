import { generatePostTagLandingPath, getSinglePositiveTagQueryValue } from '../../assets/js/RouterHelper'

const config = useRuntimeConfig()

/**
 * @see https://github.com/harlan-zw/nuxt-simple-sitemap#handling-dynamic-urls
 */
export default defineSitemapEventHandler(async () => {
  let popularSiteSearchKeywords: MatomoResponse[] = []

  if (process.env.NODE_ENV !== 'production' || !config.matomoApiKey) {
    return popularSiteSearchKeywords
  }

  try {
    popularSiteSearchKeywords = await getPopularSiteSearchKeywordsFromMatomoApi()
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.warn('[sitemap] Failed to fetch Matomo search keywords, sitemap will exclude dynamic post URLs:', errMsg)
  }

  return popularSiteSearchKeywords
    .map((keyword) => getSinglePositiveTagQueryValue(keyword.label))
    .filter((tag): tag is string => tag != null)
    .map((tag) =>
      asSitemapUrl({
        loc: generatePostTagLandingPath('rule34.xxx', tag),
        changefreq: 'daily',
        priority: 0.8,
        _i18nTransform: true
      })
    )
})

interface MatomoResponse {
  label: string
  nb_visits: number
  nb_hits: number
  sum_time_spent: number
  exit_nb_visits: number
  nb_pages_per_search: number
  avg_time_on_page: number
  bounce_rate: string
  exit_rate: string
  segment: string
}

interface MatomoErrorResponse {
  result: 'error'
  message: string
}

async function getPopularSiteSearchKeywordsFromMatomoApi(): Promise<MatomoResponse[]> {
  const baseUrl = `https://matomo.akbal.dev/`
  const apiToken = config.matomoApiKey

  const siteId = 1
  const period = 'month'
  const date = 'lastMonth'

  const response = await fetch(
    `${baseUrl}?module=API&method=Actions.getSiteSearchKeywords&idSite=${siteId}&period=${period}&date=${date}&format=JSON&filter_limit=-1&token_auth=${apiToken}`
  )

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const data: MatomoResponse[] | MatomoErrorResponse = await response.json()

  if (data.result === 'error') {
    throw new Error(data.message)
  }

  return data
}
