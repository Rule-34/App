<script lang="ts" setup>
import {toast} from 'vue-sonner'
import type {Ref} from 'vue'
import Tag from '~/assets/js/tag.dto'
import {useBooruList} from '~/composables/useBooruList'
import type {Domain} from '~/assets/js/domain'
import {ArrowRightIcon} from '@heroicons/vue/24/solid'
import * as Sentry from '@sentry/vue'
import {FetchError} from 'ofetch'

const config = useRuntimeConfig()
const $authState = useState('auth-internal')

const {pageHistory} = usePageHistory()

const {booruList} = useBooruList()
const {selectedDomainFromStorage} = useSelectedDomainFromStorage()

const selectedBooru = ref<Domain>(getDefaultBooru())

watch(selectedBooru, (booru) => {
  selectedDomainFromStorage.value = booru.domain
})

function getDefaultBooru() {
  let domain = selectedDomainFromStorage.value

  // Fallback to first Booru
  if (!domain) {
    return booruList.value[0]
  }

  const booru = booruList.value.find((booru) => booru.domain === domain)

  if (!booru) {
    toast.error(`Booru "${domain}" not found`)
    throw new Error(`Booru "${domain}" not found`)
  }

  return booru
}

function onDomainChange(domain: Domain) {
  selectedBooru.value = domain
}

const searchTagResults: Ref<Tag[]> = shallowRef([])

async function onSearchTag(tag: string) {
  const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/tags'

  const response = await $fetch(apiUrl, {
    params: {
      baseEndpoint: selectedBooru.value.domain,
      tag,
      order: 'count',
      limit: 20
    },

    headers: {
      Authorization: $authState.value['_token.local'] ?? undefined
    }
  })
    //
    .catch((error) => {
      Sentry.captureException(error)

      return error
    })

  if (response instanceof FetchError) {
    switch (response.status) {
      case 404:
        toast.error('No tags found for query "' + tag + '"')
        break

      default:
        toast.error(`Failed to load tags: "${response.message}"`)
        break
    }

    return
  }

  searchTagResults.value = response.data
}

function onSearchSubmit(tag?: string | undefined) {
  navigateTo({
    path: '/posts/' + selectedBooru.value.domain,
    query: {
      tags: tag
    }
  })
}

definePageMeta({
  middleware: [
    /**
     * Redirect to /posts/<domain> if query parameters [domain, page, tags] are set.
     */
    function (to, from) {
      if (!to) {
        return
      }

      if (Object.keys(to.query).length === 0) {
        return
      }

      if (to.query.domain == null) {
        return
      }

      const searchParams = new URLSearchParams(to.query)
      searchParams.delete('domain')

      // Redirect
      return navigateTo('/posts/' + to.query.domain + '?' + searchParams.toString())
    }
  ]
})

const featuredDomains = [
  {
    domain: 'rule34.xxx',
    path: '/posts/rule34.xxx',
    isPremium: false,
    tags: [
      {
        name: 'Top posts',
        path: '/posts/rule34.xxx?filter%5Bsort%5D=score',
        images: [
          '/img/featured/rule34.xxx/top-1.jpg',
          '/img/featured/rule34.xxx/top-2.jpg',
          '/img/featured/rule34.xxx/top-3.jpg',
          '/img/featured/rule34.xxx/top-4.jpg'
        ]
      },
      {
        name: 'Popular posts',
        path: '/posts/rule34.xxx?filter%5Bscore%5D=>%3D50',
        images: [
          '/img/featured/rule34.xxx/top-5.jpg',
          '/img/featured/rule34.xxx/top-6.jpg',
          '/img/featured/rule34.xxx/top-7.jpg',
          '/img/featured/rule34.xxx/top-8.jpeg'
        ]
      },
      {
        name: 'Animated (video)',
        path: '/posts/rule34.xxx?tags=animated',
        images: ['/img/featured/rule34.xxx/animated.jpeg']
      },
      {
        name: 'Overwatch',
        path: '/posts/rule34.xxx?tags=overwatch',
        images: [
          '/img/featured/rule34.xxx/overwatch-1.jpeg',
          '/img/featured/rule34.xxx/overwatch-2.jpeg',
          '/img/featured/rule34.xxx/overwatch-3.jpeg',
          '/img/featured/rule34.xxx/overwatch-4.jpeg',
          '/img/featured/rule34.xxx/overwatch-5.jpeg',
          '/img/featured/rule34.xxx/overwatch-6.jpeg',
          '/img/featured/rule34.xxx/overwatch-7.jpeg'
        ]
      },
      {
        name: 'Genshin Impact',
        path: '/posts/rule34.xxx?tags=genshin_impact',
        images: ['/img/featured/rule34.xxx/genshin_impact.jpg']
      },
      {
        name: 'Brawl Stars',
        path: '/posts/rule34.xxx?tags=brawl_stars',
        images: ['/img/featured/rule34.xxx/brawl_stars.jpeg']
      },
      {
        name: 'Friday Night Funkin',
        path: '/posts/rule34.xxx?tags=friday_night_funkin',
        images: ['/img/featured/rule34.xxx/friday_night_funkin.jpg']
      },
      {
        name: 'Atomic Heart',
        path: '/posts/rule34.xxx?tags=atomic_heart',
        images: ['/img/featured/rule34.xxx/atomic_heart.jpg']
      },
      {
        name: 'Minecraft',
        path: '/posts/rule34.xxx?tags=minecraft',
        images: ['/img/featured/rule34.xxx/minecraft.jpg']
      },
      {
        name: 'Murder Drones',
        path: '/posts/rule34.xxx?tags=murder_drones',
        images: ['/img/featured/rule34.xxx/murder_drones.jpg']
      },
      {
        name: 'CountryHumans',
        path: '/posts/rule34.xxx?tags=countryhumans',
        images: ['/img/featured/rule34.xxx/countryhumans.jpg']
      },
      {
        name: 'Honkai: Star Rail',
        path: '/posts/rule34.xxx?tags=honkai:_star_rail',
        images: ['/img/featured/rule34.xxx/honkai_star_rail.jpg']
      },
      {
        name: 'Five Nights at Freddy\'s',
        path: '/posts/rule34.xxx?tags=five_nights_at_freddy\'s',
        images: ['/img/featured/rule34.xxx/five_nights_at_freddys.jpg']
      },
      {
        name: 'Roblox',
        path: '/posts/rule34.xxx?tags=roblox',
        images: ['/img/featured/rule34.xxx/roblox.jpg']
      },
      {
        name: 'Undertale',
        path: '/posts/rule34.xxx?tags=undertale',
        images: ['/img/featured/rule34.xxx/undertale.jpeg']
      }
    ]
  },

  {
    domain: 'gelbooru.com',
    path: '/posts/gelbooru.com',
    isPremium: false,
    tags: [
      {
        name: 'Top posts',
        path: '/posts/gelbooru.com?filter%5Bsort%5D=score&filter%5Brating%5D=explicit',
        images: [
          '/img/featured/gelbooru.com/top-1.jpeg',
          '/img/featured/gelbooru.com/top-2.jpeg',
          '/img/featured/gelbooru.com/top-3.jpeg',
          '/img/featured/gelbooru.com/top-4.jpeg'
        ]
      },
      {
        name: 'Popular posts',
        path: '/posts/gelbooru.com?filter%5Bscore%5D=>%3D50',
        images: [
          '/img/featured/gelbooru.com/top-5.jpeg',
          '/img/featured/gelbooru.com/top-6.jpeg',
          '/img/featured/gelbooru.com/top-7.jpeg',
          '/img/featured/gelbooru.com/top-8.jpeg'
        ]
      },
      {
        name: 'Animated (video)',
        path: '/posts/gelbooru.com?tags=animated',
        images: ['/img/featured/gelbooru.com/animated.jpeg']
      },
      {
        name: 'Pokemon',
        path: '/posts/gelbooru.com?tags=pokemon',
        images: ['/img/featured/gelbooru.com/pokemon.jpeg']
      },
      {
        name: '3D',
        path: '/posts/gelbooru.com?tags=3d',
        images: ['/img/featured/gelbooru.com/3d.jpeg']
      },
      {
        name: 'Furry',
        path: '/posts/gelbooru.com?tags=furry',
        images: ['/img/featured/gelbooru.com/furry.jpeg']
      }
    ]
  },

  {
    domain: 'e621.net',
    path: '/posts/e621.net',
    isPremium: false,
    tags: [
      {
        name: 'Top posts',
        path: '/posts/e621.net?filter%5Bsort%5D=score',
        images: [
          '/img/featured/e621.net/top-1.jpeg',
          '/img/featured/e621.net/top-2.jpeg',
          '/img/featured/e621.net/top-3.jpeg',
          '/img/featured/e621.net/top-4.jpeg'
        ]
      },
      {
        name: 'Popular posts',
        path: '/posts/e621.net?filter%5Bscore%5D=>%3D50',
        images: [
          '/img/featured/e621.net/top-5.jpeg',
          '/img/featured/e621.net/top-6.jpeg',
          '/img/featured/e621.net/top-7.jpeg',
          '/img/featured/e621.net/top-8.jpeg'
        ]
      },
      {
        name: 'Animated (video)',
        path: '/posts/e621.net?tags=animated',
        images: ['/img/featured/e621.net/animated.jpeg']
      },
      {
        name: 'Gay',
        path: '/posts/e621.net?tags=gay',
        images: ['/img/featured/e621.net/gay.jpeg']
      },
      {
        name: 'Pokemon',
        path: '/posts/e621.net?tags=pokemon',
        images: ['/img/featured/e621.net/pokemon.jpeg']
      }
    ]
  },

  {
    domain: 'realbooru.com',
    path: '/posts/realbooru.com',
    isPremium: true,
    tags: [
      {
        name: 'Top posts',
        path: '/posts/realbooru.com?filter%5Bsort%5D=score',
        images: [
          '/img/featured/realbooru.com/top-1.jpeg',
          '/img/featured/realbooru.com/top-2.jpeg',
          '/img/featured/realbooru.com/top-3.jpeg',
          '/img/featured/realbooru.com/top-4.jpeg'
        ]
      },
      {
        name: 'Popular posts',
        path: '/posts/realbooru.com?filter%5Bscore%5D=>%3D50',
        images: [
          '/img/featured/realbooru.com/top-5.jpeg',
          '/img/featured/realbooru.com/top-6.jpeg',
          '/img/featured/realbooru.com/top-7.jpeg',
          '/img/featured/realbooru.com/top-8.jpeg'
        ]
      },
      {
        name: 'Animated (video)',
        path: '/posts/realbooru.com?tags=animated',
        images: ['/img/featured/realbooru.com/animated.jpeg']
      },
      {
        name: 'Cosplay',
        path: '/posts/realbooru.com?tags=cosplay',
        images: [
          '/img/featured/realbooru.com/cosplay-1.jpeg',
          '/img/featured/realbooru.com/cosplay-2.jpeg',
          '/img/featured/realbooru.com/cosplay-3.jpeg',
          '/img/featured/realbooru.com/cosplay-4.jpeg',
          '/img/featured/realbooru.com/cosplay-5.jpeg',
          '/img/featured/realbooru.com/cosplay-6.jpeg'
        ]
      },
      {
        name: 'Goth',
        path: '/posts/realbooru.com?tags=goth',
        images: [
          '/img/featured/realbooru.com/goth-1.jpeg',
          '/img/featured/realbooru.com/goth-2.jpeg',
          '/img/featured/realbooru.com/goth-3.jpeg',
          '/img/featured/realbooru.com/goth-4.jpeg',
          '/img/featured/realbooru.com/goth-5.jpeg',
          '/img/featured/realbooru.com/goth-6.jpeg',
          '/img/featured/realbooru.com/goth-7.jpeg'
        ]
      },
      {
        name: 'Asian',
        path: '/posts/realbooru.com?tags=asian',
        images: [
          '/img/featured/realbooru.com/asian-1.jpeg',
          '/img/featured/realbooru.com/asian-2.jpeg',
          '/img/featured/realbooru.com/asian-3.jpeg',
          '/img/featured/realbooru.com/asian-4.jpeg',
          '/img/featured/realbooru.com/asian-5.jpeg',
          '/img/featured/realbooru.com/asian-6.jpeg',
          '/img/featured/realbooru.com/asian-7.jpeg'
        ]
      },
      {
        name: 'Teen (+18)',
        path: '/posts/realbooru.com?tags=teen',
        images: [
          '/img/featured/realbooru.com/teen-1.jpeg',
          '/img/featured/realbooru.com/teen-2.jpeg',
          '/img/featured/realbooru.com/teen-3.jpeg',
          '/img/featured/realbooru.com/teen-4.jpeg',
          '/img/featured/realbooru.com/teen-5.jpeg',
          '/img/featured/realbooru.com/teen-6.jpeg',
          '/img/featured/realbooru.com/teen-7.jpeg'
        ]
      },
      {
        name: 'Transgender',
        path: '/posts/realbooru.com?tags=transgender',
        images: [
          '/img/featured/realbooru.com/transgender-1.jpeg',
          '/img/featured/realbooru.com/transgender-2.jpeg',
          '/img/featured/realbooru.com/transgender-3.jpeg',
          '/img/featured/realbooru.com/transgender-4.jpeg',
          '/img/featured/realbooru.com/transgender-5.jpeg',
          '/img/featured/realbooru.com/transgender-6.jpeg',
          '/img/featured/realbooru.com/transgender-7.jpeg'
        ]
      }
    ]
  }
]
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="-mt-3 text-center">
      <h1
        class="flex justify-center gap-2 text-2xl font-bold uppercase leading-10 tracking-tight text-base-content-highlight"
      >
        R34

        <img
          alt="Icon"
          class="flip-vertical-fwd h-6 w-6 text-base-content-highlight"
          height="16"
          loading="eager"
          src="/icon.svg"
          width="16"
        />

        App
      </h1>

      <p class="mt-4 leading-relaxed">Find the best hentai of your favorite characters, games, anime, and more!</p>
    </div>

    <div class="mt-8 space-y-8">
      <!-- Search -->
      <section>
        <PageHeader as="h2">
          <template #title>Search</template>
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
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util rounded-full border-0 bg-transparent p-2.5 ring-1 ring-inset ring-base-0/20 sm:text-sm"
            @click="onSearchSubmit()"
          >
            <span class="sr-only">Go to selected Booru</span>

            <ArrowRightIcon
              aria-hidden="true"
              class="h-4 w-4"
            />
          </button>
        </div>
      </section>

      <!-- Discounts -->
      <!--      <section>-->
      <!--        <FeaturedDiscount class='mt-4 m-2'/>-->
      <!--      </section>-->

      <!-- History -->
      <ClientOnly>
        <section v-if="pageHistory.length">
          <PageHeader as="h2">
            <template #title>History</template>
            <template #text>Continue where you left off</template>
          </PageHeader>

          <ShowMore :max-height-in-rem="12">
            <PageHistory class="mt-4 sm:pr-4"/>
          </ShowMore>
        </section>
      </ClientOnly>

      <!-- Featured tags -->
      <section>
        <PageHeader as="h2">
          <template #title> Featured</template>
          <template #text>Tags & filters</template>
        </PageHeader>

        <!-- TODO: Figure out a way for negative margin to work inside an overflow-hidden -->
        <ol class="mt-4 space-y-4">
          <li v-for="featuredDomain in featuredDomains">
            <div class="flex items-center pr-2">
              <NuxtLink
                :href="featuredDomain.path"
                class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util flex items-center gap-2 rounded-md px-2"
              >
                <img
                  :src="`https://icons.duckduckgo.com/ip2/${featuredDomain.domain}.ico`"
                  alt="Favicon"
                  class="h-5 w-5 rounded"
                  height="128"
                  loading="eager"
                  width="128"
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
                  Premium
                </span>
              </NuxtLink>

              <!--              <span class="ml-auto block text-xs">Scroll →</span>-->
            </div>

            <FeaturedTags
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
          <template #title>News</template>
        </PageHeader>

        <News class="mt-2 px-2"/>
      </section>
    </div>
  </main>

  <footer>
    <!-- Newsletter -->
    <Newsletter/>

    <!--  TODO: Footer -->
    <!--  TODO: Footer link to legal page -->
    <!--  TODO: Footer link to social media -->
  </footer>
</template>
