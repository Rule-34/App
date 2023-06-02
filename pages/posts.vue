<script lang="ts" setup>
  import { useBooruList } from '~/composables/useBooruList'
  import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import Tag from 'assets/js/tag.dto'
  import { Ref } from 'vue'
  import { generatePostsRoute } from 'assets/js/RouterHelper'
  import { tagArrayToTitle } from 'assets/js/SeoHelper'
  import { capitalize } from 'lodash-es'

  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()

  const { toggle: toggleSearchMenu } = useSearchMenu()
  const userSettings = useUserSettings()
  const { isPremium } = useUserData()
  const { booruList } = useBooruList()

  const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

  const selectedBooru = computed(() => {
    let domain: string | undefined = undefined

    // Restore booru from query
    if (route.query.domain) {
      domain = route.query.domain as string
    }

    // Restore booru from storage
    if (!domain) {
      domain = selectedDomainFromStorage.value
    }

    // Fallback to first booru
    if (!domain) {
      domain = booruList.value[0].domain
    }

    const booru = booruList.value.find((booru) => booru.domain === domain)

    if (!booru) {
      toast.error(`Booru "${domain}" not found`)
      throw new Error(`Booru "${domain}" not found`)
    }

    // Save selected booru to storage
    selectedDomainFromStorage.value = booru.domain

    return booru
  })

  const selectedTags = computed(() => {
    const tags = route.query.tags as string

    if (!tags) {
      return []
    }

    return tags.split('|').map((tag) => new Tag({ name: tag }))
  })

  const selectedPage = computed(() => {
    const page = route.query.page as string

    if (!page) {
      return selectedBooru.value.type.initialPageID
    }

    return parseInt(page)
  })

  const {
    data: initialPostPages,
    pending: pendingInitialPosts,
    error: errorInitialPosts,
    refresh: refreshInitialPosts
  } = await useAsyncData(
    'posts',
    () => {
      const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/posts'

      const tags = selectedTags.value.map((tag) => tag.name).join('|')

      return $fetch(apiUrl, {
        params: {
          baseEndpoint: selectedBooru.value.domain,

          limit: userSettings.postsPerPage,

          pageID: selectedPage.value,

          tags: tags.length > 0 ? tags : undefined,

          // Filters
          rating: undefined,
          sort: undefined,
          score: '>=0' // TODO
        },

        retry: 0
      })
    },

    {
      lazy: true,
      server: false,

      transform: (data) => {
        return [data]
      }
    }
  )
  // TODO: Virtualize posts
  // TODO: Restore popstate data
  const { posts, loadNextPostPage, isThereNextPostPage } = usePosts(initialPostPages)

  /**
   * `undefined` values mean that they will be replaced by default values
   */
  async function reflectChangesInUrl({
    domain = undefined,
    page = undefined,
    tags = undefined,
    filters = undefined,
    replace = false
  }: {
    domain?: string | undefined | null
    page?: number | undefined | null
    tags?: Tag[] | undefined | null
    filters?: Object | undefined | null
    replace?: boolean | undefined | null
  }) {
    if (domain === undefined) {
      domain = selectedBooru.value.domain
    }

    if (page === undefined) {
      page = selectedBooru.value.type.initialPageID
    }

    if (tags === undefined) {
      tags = selectedTags.value
    }

    const route = generatePostsRoute(domain, page, tags)

    if (replace) {
      await router.replace(route)
    } else {
      await router.push(route)
    }
  }

  const tagResults: Ref<Tag[]> = ref([])

  async function onSearchTag(tag: string) {
    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/tags'

    const response = await $fetch(apiUrl, {
      params: {
        baseEndpoint: selectedBooru.value.domain,

        tag,
        order: 'count',
        limit: 20
      },

      onResponseError(context) {
        if (context.response.status === 404) {
          tagResults.value = []
          return
        }

        toast.error(`Failed to load tags: "${context.response.statusText}"`)
      }
    })

    tagResults.value = response.data
  }

  async function onDomainChange(booru) {
    await reflectChangesInUrl({ domain: booru.domain, page: null, tags: null, filters: null })

    await refreshInitialPosts()
  }

  async function onSearchSubmit({ tags, filters }) {
    await reflectChangesInUrl({ page: null, tags, filters })

    await refreshInitialPosts()
  }

  async function onPostClickTag(tag: string) {
    await reflectChangesInUrl({ page: null, tags: [new Tag({ name: tag })], filters: null })

    await refreshInitialPosts()
  }

  async function onLoadNextPostPage() {
    // TODO: Improve this
    await reflectChangesInUrl({ page: selectedPage.value + 1 })

    await loadNextPostPage()
  }

  useHead({
    title: computed(() => {
      let title = ''

      if (selectedTags.value.length > 0) {
        title += ` ${tagArrayToTitle(selectedTags.value)}`
      }

      title += ` porn from ${selectedBooru.value.domain}`

      title = title.trim()
      title = capitalize(title)

      return title
    }),

    meta: [
      {
        name: 'description',
        content: computed(() => {
          let description = 'Stream and download porn images, GIFs and videos'

          if (selectedTags.value.length > 0) {
            description += ` featuring ${tagArrayToTitle(selectedTags.value)}`
          }

          description += ` from the ${selectedBooru.value.domain} website`

          description += '. Fast and free anime hentai with the Rule 34 App.'

          return description
        })
      },

      // Necessary so images can be loaded from other domains
      {
        name: 'referrer',
        content: 'no-referrer'
      }
    ],

    link: [
      {
        rel: 'canonical',
        href: computed(() => {
          const rawRoute = generatePostsRoute(selectedBooru.value.domain, selectedPage.value, selectedTags.value)

          return 'https://' + config.public.APP_DOMAIN + router.resolve(rawRoute).href
        })
      }
    ]
  })
</script>

<template>
  <!-- Search -->
  <SafeTeleport to="#navbar-actions">
    <!-- TODO: Add badge with tag/filter count -->
    <button
      class="focus-visible:focus-util hover:hover-bg-util rounded-lg px-2 py-1.5"
      type="button"
      @click="toggleSearchMenu()"
    >
      <span class="sr-only">Search posts</span>

      <MagnifyingGlassIcon
        aria-hidden="true"
        class="hover:hover-text-util h-6 w-6 text-base-content-highlight"
      />
    </button>
  </SafeTeleport>

  <!-- Search menu -->
  <SearchMenu
    :initial-selected-tags="selectedTags"
    :tag-results="tagResults"
    @submit="onSearchSubmit"
    @search-tag="onSearchTag"
  />

  <Teleport to="body">
    <!-- Scroll to top -->
    <ScrollTopButton />
  </Teleport>

  <!-- Container -->
  <main class="container mx-auto flex-1 px-4 sm:px-6 lg:px-8">
    <section>
      <DomainSelector
        :boorus="booruList"
        :model-value="selectedBooru"
        class="mt-4"
        @update:model-value="onDomainChange"
      />
    </section>

    <section class="my-4">
      <!-- Pending -->
      <div
        v-if="pendingInitialPosts"
        class="flex h-80 w-full animate-pulse flex-col items-center justify-center gap-4 text-lg"
      >
        <ArrowPathIcon class="h-12 w-12 animate-spin" />

        Loading posts&hellip;
      </div>

      <!-- Error -->
      <div
        v-else-if="errorInitialPosts"
        class="flex h-80 w-full flex-col items-center justify-center gap-4 text-lg"
      >
        <ExclamationCircleIcon class="h-12 w-12" />

        Failed to load posts

        <span class="text-base">{{ errorInitialPosts }}</span>
      </div>

      <!-- No results -->
      <div
        v-else-if="!posts.length"
        class="flex h-80 w-full flex-col items-center justify-center gap-4 text-lg"
      >
        <QuestionMarkCircleIcon class="h-12 w-12" />

        No results

        <span class="text-base"> Try changing the domain or the tags </span>
      </div>

      <ol
        v-else
        class="space-y-4"
      >
        <template
          v-for="(post, index) in posts"
          :key="`${selectedBooru.domain}-${post.id}`"
        >
          <!-- Post -->
          <li>
            <!-- TODO: Highlight active tags -->
            <Post
              :post="post"
              :post-name="`${selectedBooru.domain}-${post.id}`"
              @click-tag="onPostClickTag"
            />
          </li>

          <!-- Advertisement -->
          <template v-if="!isPremium && index !== 0 && index % 7 === 0">
            <li :key="`${post.id}-advertisement`">
              <Advertisement />
            </li>
          </template>
        </template>

        <!-- Load more -->
        <template v-if="isThereNextPostPage">
          <PostsPagination @load-next-page="onLoadNextPostPage" />
        </template>
      </ol>
    </section>
  </main>
</template>
