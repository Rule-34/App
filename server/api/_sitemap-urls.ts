const config = useRuntimeConfig()

/**
 * @see https://github.com/harlan-zw/nuxt-simple-sitemap#handling-dynamic-urls
 */
export default cachedEventHandler(
  async () => {
    // TODO: Fetch more data
    const popularSiteSearchKeywords = await getPopularSiteSearchKeywordsFromMatomoApi()

    return popularSiteSearchKeywords.map((keyword) => ({
      loc: `/posts?tags=${keyword.label}`,
      changefreq: 'always',
      priority: 0.8
    }))
  },
  {
    name: 'sitemap-dynamic-urls',
    maxAge: 60 * 10 // cache URLs for 10 minutes
  }
)

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

async function getPopularSiteSearchKeywordsFromMatomoApi() {
  const baseUrl = `https://matomo.akbal.dev/`
  const apiToken = config.MATOMO_API_KEY

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
