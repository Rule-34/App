<script lang="ts" setup>
  import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import * as Sentry from '@sentry/vue'
  import { useInfiniteQuery } from '@tanstack/vue-query'
  import { useWindowVirtualizer } from '@tanstack/vue-virtual'
  import { cloneDeep } from 'lodash-es'
  import { FetchError } from 'ofetch'
  import type { Ref } from 'vue'
  import { toast } from 'vue-sonner'
  import { generatePostsRoute } from '~/assets/js/RouterHelper'
  import { tagArrayToTitle } from '~/assets/js/SeoHelper'
  import type { Domain } from '~/assets/js/domain'
  import type { IPost, IPostPage } from '~/assets/js/post'
  import Tag from '~/assets/js/tag.dto'
  import { useBooruList } from '~/composables/useBooruList'

  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()
  const $authState = useState('auth-internal')

  const { toggle: toggleSearchMenu } = useSearchMenu()
  const userSettings = useUserSettings()
  const { isPremium } = useUserData()
  const { booruList } = useBooruList()
  const { addUrlToPageHistory } = usePageHistory()

  const unregisterRouterAfterEach = router.afterEach((to, from) => {
    addUrlToPageHistory(to.fullPath)
  })

  onBeforeUnmount(() => {
    unregisterRouterAfterEach()
  })

  const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

  const selectedBooru = computed(() => {
    let domain = route.params.domain

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

    return tags
      .split('|')
      .map((tag) => decodeURIComponent(tag))
      .map((tag) => new Tag({ name: tag }))
  })

  const selectedPage = computed(() => {
    const page = parseInt(route.query.page as string)

    if (!page) {
      return selectedBooru.value.type.initialPageID
    }

    return page
  })

  const defaultFiltersByBooru = {
    'rule34.xxx': {
      rating: undefined,
      sort: undefined,
      score: '>=5'
    }
  }

  const selectedFilters = computed(() => {
    // TODO: Validate

    return {
      rating: route.query.filter?.rating ?? defaultFiltersByBooru[selectedBooru.value.domain]?.rating ?? undefined,
      sort: route.query.filter?.sort ?? defaultFiltersByBooru[selectedBooru.value.domain]?.sort ?? undefined,
      score: route.query.filter?.score ?? defaultFiltersByBooru[selectedBooru.value.domain]?.score ?? undefined
    }
  })

  async function fetchPosts(options: any) {
    if (options.pageParam) {
      return $fetch<IPostPage>(options.pageParam, {
        headers: {
          Authorization: $authState.value['_token.local'] ?? undefined
        },

        retry: false
      })
    }

    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/posts'

    const tags = selectedTags.value.map((tag) => tag.name).join('|')

    return $fetch<IPostPage>(apiUrl, {
      params: {
        baseEndpoint: selectedBooru.value.domain,

        limit: userSettings.postsPerPage,

        pageID: selectedPage.value,

        tags: tags.length > 0 ? tags : undefined,

        // Filters
        rating: selectedFilters.value.rating,
        order: selectedFilters.value.sort,
        score: selectedFilters.value.score
      },

      headers: {
        Authorization: $authState.value['_token.local'] ?? undefined
      },

      retry: false
    })
  }

  // TODO: Should include page number in key, maybe an initial page number?
  const {
    suspense,

    data,
    error,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isPending,
    isError
  } = useInfiniteQuery({
    queryKey: ['posts', selectedBooru, selectedTags, selectedFilters],
    queryFn: fetchPosts,
    select: (data) => {
      // Delete all posts that have `media_type: 'unknown'`
      data.pages.forEach((page) => {
        page.data = page.data.filter((post) => post.media_type !== 'unknown')
      })

      return {
        pages: data.pages,
        pageParams: data.pageParams
      }
    },
    initialPageParam: '',
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.links.next == null) {
        return undefined
      }

      // Skip if items are less than the limit
      if (lastPage.meta.items_count !== lastPage.meta.items_per_page) {
        return undefined
      }

      return lastPage.links.next
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPage.links.prev == null) {
        return undefined
      }

      return firstPage.links.prev
    }
  })

  onServerPrefetch(async () => {
    await suspense()
  })

  const allRows = computed<IPost[]>(() => {
    if (!data.value) {
      return []
    }

    // Flatten pages, but add `current_page` to each post
    return data.value.pages.flatMap((page) => {
      return page.data.map((post) => {
        return {
          ...post,
          current_page: page.meta.current_page
        }
      })
    })
  })

  const parentRef = ref<HTMLElement | null>(null)
  const parentOffsetRef = ref(0)

  onMounted(() => {
    parentOffsetRef.value = parentRef.value?.offsetTop ?? 0
  })

  const rowVirtualizerOptions = computed(() => {
    return {
      debug: false,

      count: hasNextPage ? allRows.value.length + 1 : allRows.value.length,

      estimateSize: () => 600,

      scrollMargin: parentOffsetRef.value,

      overscan: 5
    }
  })

  const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions)

  const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())

  const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

  // Next page loader
  watchEffect(() => {
    // Skip if there is no data
    if (!data.value) {
      return
    }

    const [lastItem] = [...virtualRows.value].reverse()

    if (!lastItem) {
      return
    }

    // IF last item is the last item in the list
    // AND there is a next page
    // AND it's not fetching
    // THEN load next page
    if (lastItem.index >= allRows.value.length - 1 && hasNextPage.value && !isFetchingNextPage.value) {
      onLoadNextPostPage()
    }
  })

  // FIX: Remove when this issue is fixed - https://github.com/TanStack/virtual/issues/619#issuecomment-1969516091
  const measureElement = (el) => {
    nextTick(() => {
      if (!el) {
        return
      }

      rowVirtualizer.value.measureElement(el)
    })
  }

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
    domain?: string | null

    page?: number | null

    tags?: Tag[] | null

    filters?: Object | null

    replace?: boolean
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

    if (filters === undefined) {
      filters = selectedFilters.value
    }

    const postsRoute = generatePostsRoute(undefined, domain, page, tags, filters)

    await navigateTo({ ...postsRoute }, { replace })
  }

  const tagResults: Ref<Tag[]> = shallowRef([])

  async function onSearchTag(tag: string) {
    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/tags'

    // TODO: Use Booru options
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

    tagResults.value = response.data
  }

  async function onDomainChange(domain: Domain) {
    await reflectChangesInUrl({ domain: domain.domain, page: null, tags: null, filters: null })
  }

  async function onSearchSubmit({ tags, filters }) {
    await reflectChangesInUrl({ page: null, tags, filters })
  }

  /**
   * Adds the tag, or removes it if it already exists
   */
  async function onPostAddTag(tag: string) {
    const isTagNegative = tag.startsWith('-')

    let newTags = cloneDeep(selectedTags.value)

    // Remove tag if it already exists
    const isTagAlreadySelected = newTags.some((selectedTag) => selectedTag.name === tag)

    if (isTagAlreadySelected) {
      newTags = newTags.filter((selectedTag) => selectedTag.name !== tag)

      await reflectChangesInUrl({ page: null, tags: newTags })
      return
    }

    if (isTagNegative) {
      const doesTagExistInPositive = newTags.some((selectedTag) => selectedTag.name === tag.slice(1))

      if (doesTagExistInPositive) {
        newTags = newTags.filter((selectedTag) => selectedTag.name !== tag.slice(1))
      }
    }

    newTags.push(new Tag({ name: tag }))

    await reflectChangesInUrl({ page: null, tags: newTags })
  }

  /**
   * Sets tags to only the given tag
   */
  async function onPostSetTag(tag: string) {
    await reflectChangesInUrl({ page: null, tags: [new Tag({ name: tag })] })
  }

  /**
   * Opens the tag in a new tab
   */
  async function onPostOpenTagInNewTab(tag: string) {
    const tagUrl = generatePostsRoute(
      undefined,
      selectedBooru.value.domain,
      undefined,
      [new Tag({ name: tag })],
      undefined
    )

    const resolvedTagUrl = router.resolve(tagUrl).href

    window.open(resolvedTagUrl, '_blank')
  }

  async function onLoadNextPostPage() {
    // Skip if already fetching
    if (isFetching.value || isFetchingNextPage.value) {
      return
    }

    await reflectChangesInUrl({ page: selectedPage.value + 1, replace: true })

    await fetchNextPage()
  }

  async function onPageIndicatorClick() {
    const pagePrompt = prompt('To which page do you want to go?')

    if (pagePrompt == null) {
      return
    }

    const page = parseInt(pagePrompt, 10)

    if (isNaN(page)) {
      toast.error('Invalid page number')
      return
    }

    // TODO: Figure out a better way to reload page
    await reflectChangesInUrl({ page })
    window.location.reload()
  }

  const completeTitle = computed(() => {
    let title = ''

    // Page
    if (selectedPage.value !== selectedBooru.value.type.initialPageID) {
      title += `Page ${selectedPage.value} of `
    }

    title += 'Posts'

    // Tags
    if (selectedTags.value.length > 0) {
      title += ` tagged ${tagArrayToTitle(selectedTags.value)} Hentai`
    }

    // Filters
    if (selectedFilters.value.rating) {
      title += `, rated ${selectedFilters.value.rating}`
    }

    if (selectedFilters.value.sort) {
      title += `, sorted by ${selectedFilters.value.sort}`
    }

    if (selectedFilters.value.score) {
      title += `, score of ${selectedFilters.value.score}`
    }

    // Domain
    title += `, from ${selectedBooru.value.domain}`

    title = title.trim()

    return title
  })

  const shortTitle = computed(() => {
    let _title = completeTitle.value

    _title = _title.replace(/Posts tagged/, '')
    _title = _title.replace(/with /, '')
    _title = _title.replace(/and ?without /, ' w/o ')
    _title = _title.replace(/with a score of/, 'score')

    _title = _title.trim()
    // Capitalize first letter - https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
    _title = _title.charAt(0).toUpperCase() + _title.slice(1)

    return _title
  })

  const titleForBody = computed(() => {
    let _title = completeTitle.value

    // TODO: Show page number in body title
    _title = _title.replace(/page \d+ of /i, '')

    _title = _title.replace(/posts/i, '')

    _title = _title.replace(/ hentai, /i, ', ')

    _title = _title.replace(/, from .+$/, '')

    // Edge case: ", sorted by" || ", rated" || ", with a score of"
    if (_title.startsWith(', ')) {
      _title = _title.slice(2)
    }

    _title = _title.trim()
    // Capitalize first letter - https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
    _title = _title.charAt(0).toUpperCase() + _title.slice(1)

    return _title
  })

  const description = computed(() => {
    let description = `Stream and download ${tagArrayToTitle(selectedTags.value, false)} Hentai porn videos, GIFs and images`

    description = description.replace('download with', 'download')

    // Filters
    if (selectedFilters.value.rating) {
      description += `, rated ${selectedFilters.value.rating}`
    }

    if (selectedFilters.value.sort) {
      description += `, sorted by ${selectedFilters.value.sort}`
    }

    if (selectedFilters.value.score) {
      description += `, with a score of ${selectedFilters.value.score}`
    }

    description += `, from ${selectedBooru.value.domain}`

    // TODO: Improve ending
    description += '. Free anime hentai here on R34.app'

    return description
  })

  // TODO: Think about setting a real canonical URL
  const canonicalUrl = computed(() => {
    return window.location.href
  })

  useSeoMeta({
    title: shortTitle,

    description,

    referrer: 'no-referrer'
  })

  useHead({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ]
  })

  definePageMeta({
    validate: async (route) => {
      const { booruList } = useBooruList()

      const domain = route.params.domain

      const booru = booruList.value.find((booru) => booru.domain === domain)

      if (!booru) {
        return false
      }

      const { isPremium } = useUserData()

      if (!isPremium.value && booru.isPremium) {
        return {
          statusCode: 401,
          statusMessage: 'Unauthorized, please login to view this page'
        }
      }

      const page = route.query.page

      // Check if `page` query is not an array, not null, and is a number
      if (!Array.isArray(page) && page != undefined) {
        const parsedPage = parseInt(page)

        if (Number.isNaN(parsedPage) || parsedPage < 0) {
          return false
        }
      }

      // Validate `tags` query
      // Validate `filters` query

      return true
    }
  })

  // TODO: Create schema.org breadcrumb for posts page
</script>

<template>
  <!-- Search -->
  <!-- TODO: Find a better way to embed search -->
  <ClientOnly>
    <SafeTeleport to="#navbar-actions">
      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
        type="button"
        @click="toggleSearchMenu()"
      >
        <span class="sr-only">Search posts</span>

        <MagnifyingGlassIcon class="h-6 w-6 text-base-content-highlight" />

        <!-- Highlighter -->
        <span
          v-if="selectedTags.length || Object.values(selectedFilters).some((value) => value !== undefined)"
          class="absolute right-0 top-0 flex h-2 w-2"
        >
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-600"></span>
        </span>
      </button>
    </SafeTeleport>
  </ClientOnly>

  <!-- Search menu -->
  <SearchMenuWrapper>
    <LazySearchMenu
      :initial-selected-filters="selectedFilters"
      :initial-selected-tags="selectedTags"
      :tag-results="tagResults"
      @submit="onSearchSubmit"
      @search-tag="onSearchTag"
    />
  </SearchMenuWrapper>

  <ScrollTopButton />

  <!-- Container -->
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <section class="mb-4">
      <DomainSelector
        :boorus="booruList"
        :model-value="selectedBooru"
        @update:model-value="onDomainChange"
      />

      <!-- TODO: Move filters here -->
    </section>

    <div class="flex">
      <PageHeader class="flex-1">
        <template #title>Posts</template>
        <template
          v-if="titleForBody"
          #text
        >
          <h2 class="text-sm">
            <!-- TODO: Make tags and filters clickable so they open search menu, maybe reference the button, like a form does -->

            {{ titleForBody }}
          </h2>
        </template>
      </PageHeader>

      <!-- TODO: strip page -->
      <ShareButton
        :title="completeTitle"
        :url="canonicalUrl"
        class="my-auto"
        text=""
      />
    </div>

    <section class="my-4">
      <!-- Pending -->
      <template v-if="isPending">
        <div
          class="flex h-80 w-full animate-pulse flex-col items-center justify-center gap-4 text-lg"
          data-testid="posts-loader"
        >
          <ArrowPathIcon class="h-12 w-12 animate-spin" />

          <h3>Loading posts&hellip;</h3>
        </div>
      </template>

      <!-- Error -->
      <template v-else-if="isError">
        <div class="flex h-80 w-full flex-col items-center justify-center gap-4 text-center text-lg">
          <ExclamationCircleIcon class="h-12 w-12" />

          <template v-if="error.status === 404">
            <h3>No posts found</h3>
          </template>

          <template v-else>
            <h3>Failed to load posts</h3>
            <span class="w-full overflow-x-auto text-base">
              {{ error.data?.message ?? error.message }}
            </span>
          </template>

          <!-- TODO: Retry button -->
        </div>
      </template>

      <!-- No results -->
      <template v-else-if="!data.pages[0]?.data.length">
        <div class="flex h-80 w-full flex-col items-center justify-center gap-4 text-lg">
          <QuestionMarkCircleIcon class="h-12 w-12" />

          <h3>No results</h3>

          <span class="text-base">Try changing the domain or the tags</span>
        </div>
      </template>

      <!-- Posts -->
      <div
        v-else
        ref="parentRef"
      >
        <!-- TODO: Previous pagination -->

        <!-- TODO: Animate adding posts https://vuejs.org/guide/built-ins/transition-group.html#staggering-list-transitions -->

        <div
          :style="{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative'
          }"
        >
          <ol
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRows[0]?.start - rowVirtualizer.options.scrollMargin ?? 0}px)`
            }"
            class="space-y-4"
          >
            <li
              v-for="virtualRow in virtualRows"
              :key="virtualRow.key"
              :data-index="virtualRow.index"
              :ref="measureElement"
            >
              <!-- Next Pagination -->
              <div
                v-if="virtualRow.index > allRows.length - 1"
                class="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-base-content"
              >
                <span class="block rounded-md px-1.5 py-1">
                  {{ hasNextPage ? 'Loading more...' : 'Nothing more to load' }}
                </span>
              </div>

              <!-- Content -->
              <template v-else>
                <!-- Page indicator -->
                <button
                  v-if="virtualRow.index !== 0 && virtualRow.index % userSettings.postsPerPage === 0"
                  class="hover:hover-text-util hover:hover-bg-util focus-visible:focus-outline-util mx-auto mb-4 block rounded-md px-1.5 py-1 text-sm"
                  type="button"
                  @click="onPageIndicatorClick"
                >
                  &dharl; Page {{ allRows[virtualRow.index].current_page }} &dharl;
                </button>

                <!-- Post -->
                <!-- Fix: use domain + post.id as unique key, since virtualRow.index could be the same on different Boorus/pages -->
                <Post
                  :key="selectedBooru.domain + '-' + allRows[virtualRow.index].id"
                  :domain="selectedBooru.domain"
                  :post="allRows[virtualRow.index]"
                  :selected-tags="selectedTags"
                  @addTag="onPostAddTag"
                  @openTagInNewTab="onPostOpenTagInNewTab"
                  @setTag="onPostSetTag"
                />

                <!-- Promoted content -->
                <template v-if="!isPremium && virtualRow.index !== 0 && virtualRow.index % 7 === 0">
                  <PromotedContent class="mt-4" />
                </template>
              </template>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </main>
</template>
