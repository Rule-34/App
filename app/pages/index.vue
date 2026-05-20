<script lang="ts" setup>
  import type { Ref } from 'vue'
  import Tag, { type ITag } from '~/assets/js/tag.dto'
  import type { Domain } from '~/assets/js/domain'
  import { ArrowRightIcon } from '@heroicons/vue/24/solid'
  import { FetchError } from 'ofetch'
  import { project } from '~~/config/project'

  type FeaturedTagMedia = {
    type: 'image' | 'iframe'
    src: string
  }

  type FeaturedTag = {
    name: string
    path: string
    isAdvertisement?: boolean
    media: FeaturedTagMedia[]
  }

  type FeaturedDomain = {
    domain: string
    path: string
    isPremium: boolean
    tags: FeaturedTag[]
  }

  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const { t } = useI18n()
  const { toast } = useLazyToast()
  const localePath = useLocalePath()

  const { isPremium } = useUserData()
  const { hasInteracted } = useInteractionDetector()
  const { schedule: scheduleIdleTask } = useIdleTask()
  const { seasonalEmoji } = useSeasonalIcon()
  const { shouldShow } = useActivePromotion()

  const { booruList } = useBooruList()
  const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

  const selectedBooru = ref<Domain>(getDefaultBooru())
  const shouldLoadHistorySection = ref(false)

  watch(selectedBooru, (booru) => {
    selectedDomainFromStorage.value = booru.domain
  })

  function getFallbackBooru(): Domain {
    const fallback = booruList.value.find((booru) => booru.domain === 'rule34.xxx') ?? booruList.value[0]

    if (!fallback) {
      throw new Error('Expected at least one configured booru')
    }

    return fallback
  }

  function getDefaultBooru(): Domain {
    const domain = selectedDomainFromStorage.value

    // Fallback/Default to specific Booru (rule34.xxx)
    if (!domain) {
      return getFallbackBooru()
    }

    const booru = booruList.value.find((booru) => booru.domain === domain)

    if (!booru) {
      toast.error(t('toasts.booruNotFound', { domain }))
      return getFallbackBooru()
    }

    return booru
  }

  function onDomainChange(domain: Domain) {
    selectedBooru.value = domain
  }

  const searchTagResults: Ref<Tag[]> = shallowRef([])

  async function onSearchTag(tag: string) {
    try {
      const response = await $fetch<{ data: ITag[] }>(`/booru/${selectedBooru.value.type.type}/tags`, {
        baseURL: config.public.apiUrl,

        query: {
          baseEndpoint: selectedBooru.value.domain,

          tag,
          order: 'count',
          limit: 20,

          // Booru options
          httpScheme: selectedBooru.value.config?.options?.HTTPScheme ?? undefined
        }
      })

      searchTagResults.value = response.data.map((tag) => new Tag(tag))
    } catch (error) {
      const Sentry = await import('@sentry/nuxt')
      Sentry.captureException(error)

      searchTagResults.value = []

      if (error instanceof FetchError) {
        switch (error.status) {
          case 404:
            toast.error(t('toasts.noTagsFound', { tag }))
            break

          case 429:
            toast.error(t('errors.tooManyRequests'), {
              description: t('toasts.rateLimitDescription'),
              action: {
                label: t('toasts.verifyNotBot'),
                onClick: () => {
                  window.open(new URL('/status', config.public.apiUrl).toString(), '_blank', 'noopener,noreferrer')
                }
              }
            })
            break

          default:
            toast.error(t('toasts.failedToLoadTags', { message: error.message }))
            break
        }
      } else {
        toast.error(t('toasts.failedToLoadTags', { message: (error as Error).message }))
      }
    }
  }

  function onSearchSubmit(tag?: string | undefined) {
    navigateTo({
      path: localePath('/posts/' + selectedBooru.value.domain),
      query: {
        tags: tag
      }
    })
  }

  function hasStoredPageHistory() {
    const rawPageHistory = window.localStorage.getItem('settings-pageHistory')

    if (!rawPageHistory || rawPageHistory === '[]') {
      return false
    }

    try {
      const pageHistory = JSON.parse(rawPageHistory)
      return Array.isArray(pageHistory) ? pageHistory.length > 0 : Boolean(pageHistory)
    } catch {
      return true
    }
  }

  /**
   * Show popunders for non-premium users
   */
  onMounted(() => {
    scheduleIdleTask(() => {
      if (!hasStoredPageHistory()) {
        return
      }

      shouldLoadHistorySection.value = true
    })

    const hasLoadedAds = ref(false)

    watch(
      [hasInteracted, isPremium],
      ([hasInteracted, isPremiumUser]) => {
        if (hasLoadedAds.value) {
          return
        }

        if (!hasInteracted) {
          return
        }

        if (isPremiumUser) {
          return
        }

        scheduleIdleTask(async () => {
          if (hasLoadedAds.value || isPremium.value) {
            return
          }

          hasLoadedAds.value = true

          const { default: useAdvertisements } = await import('~/composables/useAdvertisements')
          nuxtApp.runWithContext(useAdvertisements)
        })
      },
      { immediate: true }
    )
  })

  const featuredDomains = computed<FeaturedDomain[]>(() => [
    {
      domain: 'rule34.xxx',
      path: '/posts/rule34.xxx',
      isPremium: false,
      tags: [
        {
          name: t('pages.home.topPosts'),
          path: '/posts/rule34.xxx?filter%5Bsort%5D=score',
          media: [
            { type: 'image', src: '/img/featured/rule34.xxx/top-1.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-2.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-3.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-4.jpg' }
          ]
        },
        // Advertisement from AdSession
        // {
        //   name: 'Anime AI Sluts',
        //   path: 'https://s.eunow4u.com/v1/d.php?z=2168',
        //   isAdvertisement: true,
        //   media: [
        //     { type: 'image', src: '/img/ads/Advertisement_1.webp' },
        //     { type: 'image', src: '/img/ads/Advertisement_2.webp' },
        //     { type: 'image', src: '/img/ads/Advertisement_3.webp' },
        //     { type: 'image', src: '/img/ads/Advertisement_4.webp' }
        //   ]
        // },
        {
          name: t('pages.home.trendingPosts'),
          path: '/posts/rule34.xxx?filter%5Bscore%5D=>%3D50',
          media: [
            { type: 'image', src: '/img/featured/rule34.xxx/top-5.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-7.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-6.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-8.jpeg' }
          ]
        },
        {
          name: t('pages.home.animatedVideo'),
          path: '/posts/rule34.xxx?tags=animated',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/animated.jpeg' }]
        },
        {
          name: t('pages.home.noAi'),
          path: '/posts/rule34.xxx?tags=-ai_generated',
          media: [
            { type: 'image', src: '/img/featured/rule34.xxx/animated.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/atomic_heart.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/brawl_stars.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/countryhumans.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/five_nights_at_freddys.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/friday_night_funkin.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/genshin_impact.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/honkai_star_rail.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/minecraft.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/murder_drones.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-1.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-2.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-3.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-4.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-5.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-6.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-7.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/roblox.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-1.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-2.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-3.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-4.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-5.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-6.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-7.jpg' },
            { type: 'image', src: '/img/featured/rule34.xxx/top-8.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/undertale.jpeg' }
          ]
        },
        {
          name: 'Overwatch',
          path: '/posts/rule34.xxx?tags=overwatch',
          media: [
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-1.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-2.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-3.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-4.jpeg' }
          ]
        },
        {
          name: 'Genshin Impact',
          path: '/posts/rule34.xxx?tags=genshin_impact',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/genshin_impact.jpg' }]
        },
        {
          name: 'Brawl Stars',
          path: '/posts/rule34.xxx?tags=brawl_stars',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/brawl_stars.jpeg' }]
        },
        {
          name: 'Friday Night Funkin',
          path: '/posts/rule34.xxx?tags=friday_night_funkin',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/friday_night_funkin.jpg' }]
        },
        {
          name: 'Atomic Heart',
          path: '/posts/rule34.xxx?tags=atomic_heart',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/atomic_heart.jpg' }]
        },
        {
          name: 'Minecraft',
          path: '/posts/rule34.xxx?tags=minecraft',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/minecraft.jpg' }]
        },
        {
          name: 'Murder Drones',
          path: '/posts/rule34.xxx?tags=murder_drones',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/murder_drones.jpg' }]
        },
        {
          name: 'CountryHumans',
          path: '/posts/rule34.xxx?tags=countryhumans',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/countryhumans.jpg' }]
        },
        {
          name: 'Honkai: Star Rail',
          path: '/posts/rule34.xxx?tags=honkai:_star_rail',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/honkai_star_rail.jpg' }]
        },
        {
          name: "Five Nights at Freddy's",
          path: "/posts/rule34.xxx?tags=five_nights_at_freddy's",
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/five_nights_at_freddys.jpg' }]
        },
        {
          name: 'Roblox',
          path: '/posts/rule34.xxx?tags=roblox',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/roblox.jpg' }]
        },
        {
          name: 'Undertale',
          path: '/posts/rule34.xxx?tags=undertale',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/undertale.jpeg' }]
        }
      ]
    },
    {
      domain: 'rule34.paheal.net',
      path: '/posts/rule34.paheal.net',
      isPremium: false,
      tags: [
        {
          name: t('pages.home.topPosts'),
          path: '/posts/rule34.paheal.net?filter%5Bsort%5D=score',
          media: [
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-1.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-2.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-3.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-4.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-5.jpg' }
          ]
        },
        {
          name: t('pages.home.trendingPosts'),
          path: '/posts/rule34.paheal.net?filter%5Bscore%5D=>%3D50',
          media: [
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-6.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-7.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-8.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-9.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-10.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-11.jpg' }
          ]
        },
        {
          name: t('pages.home.animatedVideo'),
          path: '/posts/rule34.paheal.net?tags=animated',
          media: [
            { type: 'image', src: '/img/featured/rule34.paheal.net/animated-1.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/animated-2.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/animated-3.jpg' }
          ]
        },
        {
          name: t('pages.home.noAi'),
          path: '/posts/rule34.paheal.net?tags=-ai_generated',
          media: [
            { type: 'image', src: '/img/featured/rule34.paheal.net/animated-1.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/animated-2.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/animated-3.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-1.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-2.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-3.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-4.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-5.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-6.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-7.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-8.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-9.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-10.jpg' },
            { type: 'image', src: '/img/featured/rule34.paheal.net/top-11.jpg' }
          ]
        },
        {
          name: 'Overwatch',
          path: '/posts/rule34.paheal.net?tags=overwatch',
          media: [
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-4.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-5.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-6.jpeg' },
            { type: 'image', src: '/img/featured/rule34.xxx/overwatch-7.jpeg' }
          ]
        },
        {
          name: 'Genshin Impact',
          path: '/posts/rule34.paheal.net?tags=genshin_impact',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/genshin_impact.jpg' }]
        },
        {
          name: 'Brawl Stars',
          path: '/posts/rule34.paheal.net?tags=brawl_stars',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/brawl_stars.jpeg' }]
        },
        {
          name: 'Friday Night Funkin',
          path: '/posts/rule34.paheal.net?tags=friday_night_funkin',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/friday_night_funkin.jpg' }]
        },
        {
          name: 'Atomic Heart',
          path: '/posts/rule34.paheal.net?tags=atomic_heart',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/atomic_heart.jpg' }]
        },
        {
          name: 'Minecraft',
          path: '/posts/rule34.paheal.net?tags=minecraft',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/minecraft.jpg' }]
        },
        {
          name: 'Murder Drones',
          path: '/posts/rule34.paheal.net?tags=murder_drones',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/murder_drones.jpg' }]
        },
        {
          name: 'CountryHumans',
          path: '/posts/rule34.paheal.net?tags=countryhumans',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/countryhumans.jpg' }]
        },
        {
          name: 'Honkai: Star Rail',
          path: '/posts/rule34.paheal.net?tags=honkai:_star_rail',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/honkai_star_rail.jpg' }]
        },
        {
          name: "Five Nights at Freddy's",
          path: "/posts/rule34.paheal.net?tags=five_nights_at_freddy's",
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/five_nights_at_freddys.jpg' }]
        },
        {
          name: 'Roblox',
          path: '/posts/rule34.paheal.net?tags=roblox',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/roblox.jpg' }]
        },
        {
          name: 'Undertale',
          path: '/posts/rule34.paheal.net?tags=undertale',
          media: [{ type: 'image', src: '/img/featured/rule34.xxx/undertale.jpeg' }]
        }
      ]
    },
    // {
    //   domain: 'gelbooru.com',
    //   path: '/posts/gelbooru.com',
    //   isPremium: false,
    //   tags: [
    //     {
    //       name: 'Top posts',
    //       path: '/posts/gelbooru.com?filter%5Bsort%5D=score&filter%5Brating%5D=explicit',
    //       media: [
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-1.jpeg' },
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-2.jpeg' },
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-3.jpeg' },
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-4.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Trending posts',
    //       path: '/posts/gelbooru.com?filter%5Bscore%5D=>%3D50',
    //       media: [
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-5.jpeg' },
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-6.jpeg' },
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-7.jpeg' },
    //         { type: 'image', src: '/img/featured/gelbooru.com/top-8.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Animated (video)',
    //       path: '/posts/gelbooru.com?tags=animated',
    //       media: [{ type: 'image', src: '/img/featured/gelbooru.com/animated.jpeg' }]
    //     },
    //     {
    //       name: 'Pokemon',
    //       path: '/posts/gelbooru.com?tags=pokemon',
    //       media: [{ type: 'image', src: '/img/featured/gelbooru.com/pokemon.jpeg' }]
    //     },
    //     {
    //       name: '3D',
    //       path: '/posts/gelbooru.com?tags=3d',
    //       media: [{ type: 'image', src: '/img/featured/gelbooru.com/3d.jpeg' }]
    //     },
    //     {
    //       name: 'Furry',
    //       path: '/posts/gelbooru.com?tags=furry',
    //       media: [{ type: 'image', src: '/img/featured/gelbooru.com/furry.jpeg' }]
    //     }
    //   ]
    // },
    {
      domain: 'e621.net',
      path: '/posts/e621.net',
      isPremium: false,
      tags: [
        {
          name: t('pages.home.topPosts'),
          path: '/posts/e621.net?filter%5Bsort%5D=score',
          media: [
            { type: 'image', src: '/img/featured/e621.net/top-1.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-2.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-3.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-4.jpeg' }
          ]
        },
        {
          name: t('pages.home.trendingPosts'),
          path: '/posts/e621.net?filter%5Bscore%5D=>%3D50',
          media: [
            { type: 'image', src: '/img/featured/e621.net/top-5.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-6.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-7.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-8.jpeg' }
          ]
        },
        {
          name: t('pages.home.animatedVideo'),
          path: '/posts/e621.net?tags=animated',
          media: [{ type: 'image', src: '/img/featured/e621.net/animated.jpeg' }]
        },
        {
          name: t('pages.home.noAi'),
          path: '/posts/e621.net?tags=-ai_generated',
          media: [
            { type: 'image', src: '/img/featured/e621.net/animated.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/gay.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/pokemon.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-1.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-2.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-3.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-4.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-5.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-6.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-7.jpeg' },
            { type: 'image', src: '/img/featured/e621.net/top-8.jpeg' }
          ]
        },
        {
          name: 'Gay',
          path: '/posts/e621.net?tags=gay',
          media: [{ type: 'image', src: '/img/featured/e621.net/gay.jpeg' }]
        },
        {
          name: 'Pokemon',
          path: '/posts/e621.net?tags=pokemon',
          media: [{ type: 'image', src: '/img/featured/e621.net/pokemon.jpeg' }]
        }
      ]
    }
    // {
    //   domain: 'realbooru.com',
    //   path: '/posts/realbooru.com',
    //   isPremium: true,
    //   tags: [
    //     {
    //       name: 'Top posts',
    //       path: '/posts/realbooru.com?filter%5Bsort%5D=score',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/top-1.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/top-2.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/top-3.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/top-4.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Trending posts',
    //       path: '/posts/realbooru.com?filter%5Bscore%5D=>%3D50',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/top-5.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/top-6.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/top-7.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/top-8.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Animated (video)',
    //       path: '/posts/realbooru.com?tags=animated',
    //       media: [{ type: 'image', src: '/img/featured/realbooru.com/animated.jpeg' }]
    //     },
    //     {
    //       name: 'Cosplay',
    //       path: '/posts/realbooru.com?tags=cosplay',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/cosplay-1.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/cosplay-2.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/cosplay-3.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/cosplay-4.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/cosplay-5.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/cosplay-6.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Goth',
    //       path: '/posts/realbooru.com?tags=goth',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-1.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-2.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-3.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-4.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-5.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-6.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/goth-7.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Asian',
    //       path: '/posts/realbooru.com?tags=asian',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-1.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-2.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-3.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-4.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-5.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-6.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/asian-7.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Teen (+18)',
    //       path: '/posts/realbooru.com?tags=teen',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-1.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-2.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-3.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-4.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-5.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-6.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/teen-7.jpeg' }
    //       ]
    //     },
    //     {
    //       name: 'Transgender',
    //       path: '/posts/realbooru.com?tags=transgender',
    //       media: [
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-1.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-2.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-3.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-4.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-5.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-6.jpeg' },
    //         { type: 'image', src: '/img/featured/realbooru.com/transgender-7.jpeg' }
    //       ]
    //     }
    //   ]
    // }
  ])

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        {
          name: t('nav.home'),
          item: localePath('/')
        }
      ]
    }),

    defineWebSite({
      name: project.name,

      potentialAction: [
        // TODO: Listen to router
        defineSearchAction({
          target: '/posts/rule34.xxx?tags={search_term_string}'
        })
      ]
    }),

    defineWebPage(),

    defineOrganization({
      name: project.name,
      logo: '/icon.svg',
      sameAs: [
        project.urls.production.toString(),
        project.social.twitter,
        project.social.discord,
        project.social.github
      ]
    }),

    defineProduct({
      name: project.name,
      // @see https://www.trustpilot.com/review/r34.app
      aggregateRating: {
        ratingValue: 4.5,
        ratingCount: 331
      }
    })
  ])
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="-mt-3 text-center">
      <h1
        class="flex justify-center gap-2 text-2xl leading-10 font-bold tracking-tight text-base-content-highlight uppercase"
      >
        R34

        <img
          v-if="!seasonalEmoji"
          :alt="$t('common.icon')"
          class="flip-vertical-fwd h-6 w-6 text-base-content-highlight"
          height="16"
          src="/icon.svg"
          width="16"
        />

        <!-- Seasonal Icon -->
        <span
          v-else
          class="flip-vertical-fwd flex h-6 w-6 items-center justify-center text-2xl"
          style="mask-image: url('/icon.svg'); mask-size: contain; mask-repeat: no-repeat; mask-position: center"
        >
          {{ seasonalEmoji }}
        </span>

        App
      </h1>

      <p class="mt-4 leading-relaxed">{{ $t('pages.home.heroDescription') }}</p>
    </div>

    <div class="mt-8 space-y-8">
      <!-- Search -->
      <section>
        <PageHeader as="h2">
          <template #title>{{ $t('pages.home.searchTitle') }}</template>
        </PageHeader>

        <div class="mt-2 flex items-center gap-2">
          <!-- TODO: Find a better fix for modelValue not updating on hydration -->
          <ClientOnly>
            <DomainSelector
              :boorus="booruList"
              :compact="true"
              :model-value="selectedBooru"
              class="self-stretch"
              @update:model-value="onDomainChange"
            />

            <template #fallback>
              <DomainSelectorFallback
                :compact="true"
                class="self-stretch"
              />
            </template>
          </ClientOnly>

          <SimpleSearch
            :tag-results="searchTagResults"
            class="flex-auto"
            @submit="onSearchSubmit"
            @search-tag="onSearchTag"
          />

          <button
            :aria-label="$t('common.goToSelectedBooru')"
            class="rounded-full border-0 bg-transparent p-2.5 ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm"
            @click="onSearchSubmit()"
          >
            <ArrowRightIcon
              aria-hidden="true"
              class="h-4 w-4"
            />
          </button>
        </div>
      </section>

      <ClientOnly>
        <!-- Discounts -->
        <section>
          <LazyPromotionalBanner
            v-if="shouldShow"
            class="mt-4 mb-2"
          />
        </section>

        <LazyPageHistorySection v-if="shouldLoadHistorySection" />
      </ClientOnly>

      <!-- Featured tags -->
      <section>
        <PageHeader as="h2">
          <template #title>{{ $t('pages.home.featuredTitle') }}</template>
          <template #text>{{ $t('pages.home.featuredText') }}</template>
        </PageHeader>

        <!-- TODO: Figure out a way for negative margin to work inside an overflow-hidden -->
        <ol class="mt-4 space-y-4">
          <li
            v-for="(featuredDomain, featuredDomainIndex) in featuredDomains"
            :key="featuredDomain.domain + '-' + featuredDomain.tags.length"
          >
            <div class="flex items-center pr-2">
              <NuxtLink
                :href="localePath(featuredDomain.path)"
                class="flex items-center gap-2 rounded-md px-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
              >
                <img
                  :alt="$t('common.favicon')"
                  :decoding="featuredDomainIndex === 0 ? undefined : 'async'"
                  :fetchpriority="featuredDomainIndex === 0 ? undefined : 'low'"
                  :loading="featuredDomainIndex === 0 ? 'eager' : 'lazy'"
                  :src="useFaviconUrl(featuredDomain.domain)"
                  class="h-5 w-5 rounded-sm"
                  height="64"
                  width="64"
                />

                <!-- TODO: Add icon for top posts, animated, etc. -->
                <ContentContainer
                  :title="featuredDomain.domain"
                  as="h3"
                />

                <span
                  v-if="featuredDomain.isPremium"
                  class="inline-flex items-center rounded-full border-2 border-primary-500/60 px-2.5 py-0.5 text-xs font-medium text-base-content-highlight"
                >
                  {{ $t('common.premium') }}
                </span>
              </NuxtLink>

              <!--              <span class="ml-auto block text-xs">Scroll →</span>-->
            </div>

            <FeaturedTags
              :domain="featuredDomain.domain"
              :priority-count="featuredDomainIndex === 0 ? 1 : 0"
              :tags="featuredDomain.tags"
              class="-mx-4 px-4 py-2"
            />
          </li>
        </ol>
      </section>

      <!-- TODO: Top tags from last month -->

      <!-- TODO: Premium options -->

      <!-- News -->
      <section>
        <PageHeader as="h2">
          <template #title>{{ $t('pages.home.newsTitle') }}</template>
        </PageHeader>

        <News class="mt-2 px-2" />
      </section>
    </div>
  </main>

  <footer>
    <!-- Newsletter -->
    <Newsletter />

    <!--  TODO: Footer -->
    <!--  TODO: Footer link to legal page -->
    <!--  TODO: Footer link to social media -->
  </footer>
</template>
