<script lang="ts" setup>
  import { Bars3BottomRightIcon, EyeIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import * as Sentry from '@sentry/nuxt'
  import { useInfiniteQuery } from '@tanstack/vue-query'
  import { useWindowVirtualizer } from '@tanstack/vue-virtual'
  import { cloneDeep, throttle } from 'es-toolkit'
  import { FetchError } from 'ofetch'
  import type { Ref } from 'vue'
  import { toast } from 'vue-sonner'
  import { generatePostsRoute } from '~/assets/js/RouterHelper'
  import { tagArrayToTitle } from '~/assets/js/SeoHelper'
  import type { Domain } from '~/assets/js/domain'
  import type { IPost, IPostPage } from '~/assets/js/post.dto'
  import Tag from '~/assets/js/tag.dto'
  import { project } from '@/config/project'

  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()

  const { postsPerPage } = useUserSettings()
  const { isPremium } = useUserData()
  const { hasInteracted } = useInteractionDetector()
  const { booruList } = useBooruList()
  const { selectedBlockList } = useBlockLists()
  const { addUrlToPageHistory } = usePageHistory()
  const { toggle: toggleSearchMenu } = useSearchMenu()

  const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

  /**
   * Show ads for non-premium users
   */
  onMounted(() => {
    if (isPremium.value) {
      return
    }

    watch(hasInteracted, (hasInteracted) => {
      if (!hasInteracted) {
        return
      }

      useAdvertisements()
    })
  })

  /**
   * URL
   */
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
      .map((tag) => new Tag({ name: tag }).toJSON())
  })

  const selectedPage = computed(() => {
    const page = parseInt(route.query.page as string)

    if (!page) {
      return selectedBooru.value.type.initialPageID
    }

    return page
  })

  const selectedFilters = computed(() => {
    // TODO: Validate

    return {
      rating: route.query.filter?.rating ?? undefined,
      sort: route.query.filter?.sort ?? undefined,
      score: route.query.filter?.score ?? undefined
    }
  })

  const filterConfig = {
    sort: {
      type: 'select' as const,
      label: 'Sort',
      icon: Bars3BottomRightIcon,
      options: [
        { label: 'Sort', value: undefined },
        { label: 'Score', value: 'score' },
        { label: 'Created', value: 'id' },
        { label: 'Random', value: 'random' }
      ]
    },
    rating: {
      type: 'select' as const,
      label: 'Rating',
      icon: EyeIcon,
      options: [
        { label: 'Rating', value: undefined },
        { label: 'Safe', value: 'safe' },
        { label: 'General', value: 'general' },
        { label: 'Sensitive', value: 'sensitive' },
        { label: 'Questionable', value: 'questionable' },
        { label: 'Explicit', value: 'explicit' }
      ]
    },
    score: {
      type: 'select' as const,
      label: 'Score',
      icon: StarIcon,
      options: [
        { label: 'Score', value: undefined },
        { label: '>= 0', value: '>=0' },

        { label: '>= 5', value: '>=5' },

        { label: '>= 10', value: '>=10' },
        { label: '>= 25', value: '>=25' },
        { label: '>= 50', value: '>=50' },
        { label: '>= 75', value: '>=75' },

        { label: '>= 100', value: '>=100' },
        { label: '>= 200', value: '>=200' },
        { label: '>= 300', value: '>=300' },
        { label: '>= 500', value: '>=500' },
        { label: '>= 750', value: '>=750' },

        { label: '>= 1000', value: '>=1000' }
      ]
    }
  }

  /**
   * Misc
   */
  const unregisterRouterAfterEach = router.afterEach((to, from) => {
    addUrlToPageHistory(to.fullPath)
  })

  onBeforeUnmount(() => {
    unregisterRouterAfterEach()
  })

  const tagResults: Ref<Tag[]> = shallowRef([])

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

  /**
   * Listeners
   */
  async function onSearchTag(tag: string) {
    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/tags'

    const response = await $fetch(apiUrl, {
      params: {
        baseEndpoint: selectedBooru.value.domain,

        tag,
        order: 'count',
        limit: 20,

        // Booru options
        httpScheme: selectedBooru.value.config?.options?.HTTPScheme ?? undefined
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

        case 429:
          // TODO: Cant always check if 429 is the status code, always show?
          toast.error(response.statusText, {
            description: 'You sent too many requests in a short period of time',
            action: {
              label: 'Verify I am not a Bot',
              onClick: () => window.open(config.public.API_URL + '/status', '_blank')
            }
          })
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

    newTags.push(new Tag({ name: tag }).toJSON())

    await reflectChangesInUrl({ page: null, tags: newTags })
  }

  /**
   * Sets tags to only the given tag
   */
  async function onPostSetTag(tag: string) {
    await reflectChangesInUrl({ page: null, tags: [new Tag({ name: tag }).toJSON()] })
  }

  /**
   * Opens the tag in a new tab
   */
  async function onPostOpenTagInNewTab(tag: string) {
    const tagUrl = generatePostsRoute(
      undefined,
      selectedBooru.value.domain,
      undefined,
      [new Tag({ name: tag }).toJSON()],
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

  const debouncedOnLoadNextPostPage = throttle(onLoadNextPostPage, 1000, {
    trailing: false
  })

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

    window.scrollTo({
      top: 0
    })

    window.location.reload()
  }

  function onRetryClick() {
    window.location.reload()
  }

  /**
   * Data fetching
   */
  async function fetchPosts(options: any): Promise<IPostPage> {
    // Return early if selectedTags is in blocklist
    if (
      selectedBlockList.value.length > 0 &&
      //
      // selectedTags.value.some((tag) => selectedBlockList.value.includes(tag.name)) &&
      selectedBlockList.value.some((blocklistTag) => selectedTags.value.map((tag) => tag.name).includes(blocklistTag))
    ) {
      throw new Error('One of your selected tags is in the tag block list')
    }

    if (options.pageParam) {
      return $fetch<IPostPage>(options.pageParam, {
        retry: false
      })
    }

    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/posts'

    const tags = selectedTags.value.map((tag) => tag.name).join('|')

    return $fetch<IPostPage>(apiUrl, {
      params: {
        baseEndpoint: selectedBooru.value.domain,

        limit: postsPerPage.value,

        pageID: selectedPage.value,

        tags: tags.length > 0 ? tags : undefined,

        // Filters
        order: selectedFilters.value.sort,
        rating: selectedFilters.value.rating,
        score: selectedFilters.value.score,

        // Booru options
        httpScheme: selectedBooru.value.config?.options?.HTTPScheme ?? undefined
      },

      retry: false
    })
  }

  // TODO: Save cache from and to History API state
  const {
    suspense,

    data,

    isPending,

    refetch,
    isFetching,

    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,

    hasPreviousPage,
    fetchPreviousPage,

    error,
    isError,
    isFetchNextPageError
  } = useInfiniteQuery({
    queryKey: [
      //
      'posts',
      //
      selectedBooru,
      selectedTags,
      selectedFilters,
      //
      selectedPage.value,
      //
      postsPerPage.value
    ],

    queryFn: fetchPosts,

    // Stale after 5 minutes
    // Same as Nuxt route rules
    // @see nuxt.config.js
    staleTime: 1000 * 60 * 5,

    // Fix: Never set maxPages to avoid scroll issues
    // maxPages: 10,

    select: (data) => {
      //

      // Only execute for the last page
      const [page] = [...data.pages].reverse()

      if (!page) {
        return data
      }

      page.data = page.data.filter((post) => {
        //

        // Delete all posts that have `media_type: 'unknown'`
        if (!post.media_type || post.media_type === 'unknown') {
          return false
        }

        // Delete all posts that have a blocklisted tag
        if (selectedBlockList.value.length > 0) {
          const postTags = post.tags.meta.concat(
            post.tags.general,
            post.tags.artist,
            post.tags.character,
            post.tags.copyright
          )

          const foundBlockedTag = selectedBlockList.value.some((blocklistTag) => postTags.includes(blocklistTag))

          if (foundBlockedTag) {
            return false
          }
        }

        return true
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

      if (lastPage.meta.items_count === 0) {
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

  // TODO: Find a better way to prefetch on server?
  // onServerPrefetch(async () => {
  //   await suspense()
  // })
  if (import.meta.server) {
    await suspense()
  }

  /**
   * Virtualization
   */
  const allRows = computed<IPost[]>(() => {
    if (!data.value) {
      return []
    }

    // Flatten pages
    return data.value.pages.flatMap((page) => {
      //

      return page.data.flatMap((post, index) => {
        //

        return {
          ...post,

          // Custom meta data
          // TODO: Remove when API returns domain
          domain: selectedBooru.value.domain,

          current_page: page.meta.current_page,
          isFirstPost: index === 0
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
      count: hasNextPage.value ? allRows.value.length + 1 : allRows.value.length,

      estimateSize: () => 600,

      // For SSR
      initialRect: {
        width: 800,
        height: 600
      },

      scrollMargin: parentOffsetRef.value,

      overscan: 5,

      gap: 16
    }
  })

  const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions)

  const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())

  const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

  // Next page loader
  watchEffect(() => {
    // Only run on client
    if (!import.meta.client) {
      return
    }

    // Skip if there is no data
    if (!allRows.value) {
      return
    }

    const [lastItem] = [...virtualRows.value].reverse()

    if (!lastItem) {
      return
    }

    // IF last item is the last item in the list
    // AND there is a next page
    // AND it's not fetching
    // AND there's no error (to prevent infinite retry loop)
    // THEN load next page automatically
    if (
      lastItem.index >= allRows.value.length - 1 &&
      hasNextPage.value &&
      !isFetchingNextPage.value &&
      !isError.value
    ) {
      debouncedOnLoadNextPostPage()
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
   * SEO
   */
  const completeTitle = computed(() => {
    let title = ''

    // Page
    if (selectedPage.value !== selectedBooru.value.type.initialPageID) {
      title += `Page ${selectedPage.value} of `
    }

    title += 'Posts'

    // Tags
    if (selectedTags.value.length > 0) {
      title += ` tagged ${tagArrayToTitle(selectedTags.value)} hentai videos, GIFs, and images`
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

    if (selectedTags.value.length > 0) {
      _title = _title.replace(/, from .+$/, '')
    }

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

    _title = _title.replace(/tagged with/i, '')

    _title = _title.replace(/hentai videos, GIFs, and images/i, 'rule 34 hentai')

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
    const tagsTitle = tagArrayToTitle(selectedTags.value, false)

    let description = `Stream and download ${tagsTitle ?? 'various'} Hentai porn videos, GIFs and images`

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
    description += `. Free anime hentai here on ${project.shortName}`

    return description
  })

  useSeoMeta({
    title: shortTitle,

    description
  })

  const firstPostsPageAsSchema = computed(() => {
    if (!data.value?.pages.length) {
      return []
    }

    return data.value?.pages[0].data.map((post) => {
      switch (post.media_type) {
        case 'image':
        case 'animated':
          return defineImage({
            url: post.high_res_file.url,

            height: post.high_res_file.height,
            width: post.high_res_file.width

            // author: post.tags.artist.map((tag) => tag.name).join(', ')
          })

        case 'video':
          return defineVideo({
            url: post.high_res_file.url,

            thumbnailUrl: post.preview_file.url,

            height: post.high_res_file.height,
            width: post.high_res_file.width,

            // Unknown, so default to 0
            uploadDate: '1970-01-01',

            isFamilyFriendly: false
          })
        default:
          return
      }
    })
  })

  useSchemaOrg(() => [
    defineWebPage({
      // @see https://unhead.unjs.io/schema-org/recipes/site-search#define-your-search-results-page
      '@type': ['CollectionPage', 'SearchResultsPage']
    }),

    defineBreadcrumb({
      itemListElement: [
        {
          name: 'Home',
          item: '/'
        },
        {
          name: `Posts from ${selectedBooru.value.domain}`,
          item: route.path
        }
      ]
    }),

    ...firstPostsPageAsSchema.value
  ])

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
</script>

<template>
  <!-- Search -->
  <!-- TODO: Find a better way to embed search -->
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <button
        aria-label="Search posts"
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
        type="button"
        @click="toggleSearchMenu()"
      >
        <MagnifyingGlassIcon
          aria-hidden="true"
          class="text-base-content-highlight h-6 w-6"
        />

        <!-- Highlighter -->
        <span
          v-if="selectedTags.length || Object.values(selectedFilters).some((value) => value !== undefined)"
          class="absolute top-0 right-0 flex h-2 w-2"
        >
          <span class="bg-primary-600 relative inline-flex h-2 w-2 rounded-full"></span>
        </span>
      </button>
    </Teleport>
  </ClientOnly>

  <!-- Search menu -->
  <SearchMenuWrapper>
    <LazySearchMenu
      :filter-config="filterConfig"
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
      <PageHeader
        as="h2"
        class="flex-1"
      >
        <template #title>Posts</template>
        <template
          v-if="titleForBody"
          #text
        >
          <h1 class="text-sm">
            <!-- TODO: Make tags and filters clickable so they open search menu, maybe reference the button, like a form does -->

            {{ titleForBody }}
          </h1>
        </template>
      </PageHeader>

      <!-- TODO: strip page -->
      <ShareButton
        :title="completeTitle"
        class="my-auto p-3"
      />
    </div>

    <section class="my-4">
      <!-- Pending -->
      <template v-if="isPending">
        <div
          class="flex h-80 w-full animate-pulse flex-col items-center justify-center gap-4 text-lg"
          data-testid="posts-loader"
        >
          <ArrowPathIcon
            aria-hidden="true"
            class="h-12 w-12 animate-spin"
          />

          <h3>Loading posts&hellip;</h3>
        </div>
      </template>

      <!-- Error (initial load only) -->
      <template v-else-if="isError && !allRows.length">
        <PostPageError
          :error="error"
          :on-retry="onRetryClick"
          class="mt-32"
        />
      </template>

      <!-- No results -->
      <template v-else-if="!allRows.length">
        <div class="mt-32 text-center">
          <QuestionMarkCircleIcon
            aria-hidden="true"
            class="mx-auto mb-1 h-12 w-12"
          />

          <h3 class="text-lg leading-10 font-semibold">No results</h3>

          <span class="w-full overflow-x-auto text-pretty">Try changing the tags or filters</span>
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
          <!-- TODO: Fix SSR mismatches -->
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
              :ref="measureElement"
              :data-index="virtualRow.index"
            >
              <!-- Next Pagination -->
              <div
                v-if="virtualRow.index > allRows.length - 1"
                class="text-base-content flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
              >
                <!-- Error loading next page -->
                <div v-if="isFetchNextPageError">
                  <PostPageError
                    :error="error"
                    :on-retry="fetchNextPage"
                    class="my-12"
                  />
                </div>

                <!-- Normal pagination states -->
                <span
                  v-else
                  class="block rounded-md px-1.5 py-1"
                >
                  <template v-if="isFetching"> Loading more... </template>

                  <template v-else-if="hasNextPage"> Reach here to load more </template>
                </span>
              </div>

              <!-- Content -->
              <template v-else>
                <!-- Page indicator -->
                <!-- TODO: Show individually, not attached to a post-->
                <button
                  v-if="virtualRow.index !== 0 && allRows[virtualRow.index].isFirstPost"
                  class="hover:hover-text-util hover:hover-bg-util focus-visible:focus-outline-util mx-auto mb-4 block rounded-md px-1.5 py-1 text-sm"
                  type="button"
                  @click="onPageIndicatorClick"
                >
                  &dharl; Page {{ allRows[virtualRow.index].current_page }} &dharr;
                </button>

                <!-- Post -->
                <!-- Fix: use domain + post.id as unique key, since virtualRow.index could be the same on different Boorus/pages -->
                <PostComponent
                  :key="selectedBooru.domain + '-' + allRows[virtualRow.index].id"
                  :post="allRows[virtualRow.index]"
                  :postIndex="virtualRow.index"
                  :selectedTags="selectedTags"
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

        <!-- Nothing more to load message -->
        <div
          v-if="!hasNextPage && !isFetching && allRows.length"
          class="text-base-content mt-4 flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
        >
          <span class="block rounded-md px-1.5 py-1"> Nothing more to load </span>
        </div>
      </div>
    </section>

    <PostsPageFooter
      v-if="!isPending && !isError && allRows.length"
      :posts-count="allRows.length"
      :selected-booru="selectedBooru"
      :selected-filters="selectedFilters"
      :selected-tags="selectedTags"
    />
  </main>
</template>
