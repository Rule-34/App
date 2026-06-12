<script lang="ts" setup>
  import { Bars3BottomRightIcon, EyeIcon, MagnifyingGlassIcon, PhotoIcon, StarIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { useInfiniteQuery } from '@tanstack/vue-query'
  import type { QueryFunctionContext } from '@tanstack/vue-query'
  import { useWindowVirtualizer } from '@tanstack/vue-virtual'
  import { throttle } from 'es-toolkit'
  import type { ComponentPublicInstance, Ref } from 'vue'
  import type { Domain } from '~/assets/js/domain'
  import Tag from '~/assets/js/tag.dto'
  import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import { isRenderablePost, type IPostPage, type IRenderablePost } from '~/assets/js/post.dto'
  import { generatePostsRoute, getFilterQueryValue, getSingleQueryValue } from '~/assets/js/RouterHelper'
  import { useTagTitle } from '~/composables/useTagTitle'
  import { PremiumCloudRepository, type PremiumCloudPocketBaseClient } from '~/repositories/PremiumCloudRepository'
  import { project } from '~~/config/project'

  type PostRow = IRenderablePost & {
    current_page: number
    isFirstPost: boolean
  }

  const savedPostBooruType = booruTypeList[0]
  const savedPostsDomain = project.urls.production.hostname

  if (!savedPostBooruType) {
    throw new Error('Expected at least one configured booru type')
  }

  const route = useRoute()
  const localePath = useLocalePath()
  const { t } = useI18n()
  const { toast } = useLazyToast()
  const buildTagTitle = useTagTitle()

  const { $pocketBase } = useNuxtApp()
  const repository = computed(() => new PremiumCloudRepository($pocketBase as unknown as PremiumCloudPocketBaseClient))

  const { postsPerPage } = useUserSettings()
  const { toggle: toggleSearchMenu } = useSearchMenu()

  const savedPostsBooru = {
    domain: savedPostsDomain,
    type: savedPostBooruType,
    config: null,
    isCustom: false,
    isPremium: false
  } satisfies Domain
  const booruList = [savedPostsBooru] satisfies Domain[]

  const routeDomain = Array.isArray(route.params.domain) ? route.params.domain[0] : route.params.domain

  if (routeDomain && routeDomain !== savedPostsDomain) {
    await navigateTo(
      { path: localePath(`/premium/saved-posts/${savedPostsDomain}`), query: route.query },
      { replace: true }
    )
  }

  useHead({
    link: [
      { key: 'imgproxy-preconnect', rel: 'preconnect', href: project.imgproxy.baseUrl },
      { key: 'imgproxy-dns-prefetch', rel: 'dns-prefetch', href: project.imgproxy.baseUrl }
    ]
  })

  const selectedTags = computed(() => {
    const tags = getSingleQueryValue(route.query.tags)

    if (!tags) {
      return []
    }

    return tags.split('|').map((tag) => new Tag({ name: tag }).toJSON())
  })

  const selectedPage = computed(() => {
    const page = parseInt(route.query.page as string)

    if (!page) {
      return 1
    }

    return page
  })

  const selectedFilters = computed(() => {
    // TODO: Validate

    return {
      type: getFilterQueryValue(route.query, 'type') ?? undefined,
      rating: getFilterQueryValue(route.query, 'rating') ?? undefined,
      sort: getFilterQueryValue(route.query, 'sort') ?? undefined,
      score: getFilterQueryValue(route.query, 'score') ?? undefined
    }
  })

  const filterConfig = computed(() => ({
    type: {
      type: 'select' as const,
      label: t('filters.type'),
      icon: PhotoIcon,
      options: [
        { label: t('filters.type'), value: undefined },
        { label: t('filters.typeImage'), value: 'image' },
        { label: t('filters.typeAnimated'), value: 'animated' },
        { label: t('filters.typeVideo'), value: 'video' }
      ]
    },
    sort: {
      type: 'select' as const,
      label: t('filters.sort'),
      icon: Bars3BottomRightIcon,
      options: [
        { label: t('filters.sort'), value: undefined },
        { label: t('filters.sortByScore'), value: '-score' },
        { label: t('filters.sortByScoreAsc'), value: 'score' },
        { label: t('filters.sortByCreated'), value: '-created' },
        { label: t('filters.sortByCreatedAsc'), value: 'created' },
        { label: t('filters.sortByRandom'), value: '@random' }
      ]
    },
    rating: {
      type: 'select' as const,
      label: t('filters.rating'),
      icon: EyeIcon,
      options: [
        { label: t('filters.rating'), value: undefined },
        { label: t('filters.ratingSafe'), value: 'safe' },
        { label: t('filters.ratingGeneral'), value: 'general' },
        { label: t('filters.ratingSensitive'), value: 'sensitive' },
        { label: t('filters.ratingQuestionable'), value: 'questionable' },
        { label: t('filters.ratingExplicit'), value: 'explicit' }
      ]
    },
    score: {
      type: 'select' as const,
      label: t('filters.score'),
      icon: StarIcon,
      options: [
        { label: t('filters.score'), value: undefined },
        { label: '>= 0', value: 0 },

        { label: '>= 5', value: 5 },

        { label: '>= 10', value: 10 },
        { label: '>= 25', value: 25 },
        { label: '>= 50', value: 50 },
        { label: '>= 75', value: 75 },

        { label: '>= 100', value: 100 },
        { label: '>= 200', value: 200 },
        { label: '>= 300', value: 300 },
        { label: '>= 500', value: 500 },
        { label: '>= 750', value: 750 },

        { label: '>= 1000', value: 1000 }
      ]
    }
  }))

  /**
   * Misc
   */
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

    filters?: Record<string, unknown> | null

    replace?: boolean
  }) {
    if (domain === undefined) {
      domain = savedPostsBooru.domain
    }

    if (page === undefined) {
      page = savedPostsBooru.type.initialPageID
    }

    if (tags === undefined) {
      tags = selectedTags.value
    }

    if (filters === undefined) {
      filters = selectedFilters.value
    }

    const postsRoute = generatePostsRoute('/premium/saved-posts', domain, page, tags, filters)

    await navigateTo({ path: localePath(postsRoute.path), query: postsRoute.query }, { replace })
  }

  /**
   * Listeners
   */
  async function onSearchTag(_tag: string) {
    toast.error(t('toasts.autocompleteNotImplemented'))
  }

  async function onDomainChange(domain: Domain) {
    await reflectChangesInUrl({ domain: domain.domain, page: null, tags: null, filters: null })
  }

  async function onSearchSubmit({ filters }: { tags: Tag[]; filters: Record<string, unknown> }) {
    // TODO: Tags
    await reflectChangesInUrl({ page: null, filters })
  }

  /**
   * Adds the tag, or removes it if it already exists
   */
  async function onPostAddTag(_tag: string) {
    toast.error(t('toasts.notImplemented'))
  }

  /**
   * Sets tags to only the given tag
   */
  async function onPostSetTag(_tag: string) {
    toast.error(t('toasts.notImplemented'))
  }

  /**
   * Opens the tag in a new tab
   */
  async function onPostOpenTagInNewTab(_tag: string) {
    toast.error(t('toasts.notImplemented'))
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
    edges: ['leading']
  })

  async function onPageIndicatorClick() {
    const pagePrompt = prompt(t('common.promptPageNumber'))

    if (pagePrompt == null) {
      return
    }

    const page = parseInt(pagePrompt, 10)

    if (isNaN(page)) {
      toast.error(t('toasts.invalidPageNumber'))
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
  type IPostPageFromPocketBase = Omit<IPostPage, 'links'>

  async function fetchPosts({
    pageParam
  }: QueryFunctionContext<readonly unknown[], number>): Promise<IPostPageFromPocketBase> {
    const page = pageParam

    // TODO
    // if (selectedTags.value.length > 0) {
    // }

    return repository.value.loadSavedPostsPage({
      page,
      perPage: postsPerPage.value,
      filters: {
        type: selectedFilters.value.type,
        rating: selectedFilters.value.rating,
        score: selectedFilters.value.score,
        sort: selectedFilters.value.sort
      }
    })
  }

  const {
    suspense,

    data,

    isPending,

    isFetching,

    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,

    error,
    isError,
    isFetchNextPageError
  } = useInfiniteQuery({
    // Keep saved-posts viewer progress stable. Do not include savedPostList
    // or a saved-posts revision in this query key, and do not prune cached
    // rows when a post is unsaved from this page. The button state can update
    // immediately, but the row should remain until a normal reload/refetch so
    // users do not lose their place while reviewing saved posts.
    queryKey: [
      //
      'saved-posts',
      //
      savedPostsDomain,
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
    // @see nuxt.config.ts
    staleTime: 1000 * 60 * 5,

    maxPages: 10,

    initialPageParam: selectedPage.value,

    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // If items are less than the limit, the end has been reached
      if (lastPage.meta.items_count !== lastPage.meta.items_per_page) {
        return undefined
      }

      // TODO: Use selectedPage.value instead of lastPageParam

      return lastPageParam + 1
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
  const allRows = computed<PostRow[]>(() => {
    if (!data.value) {
      return []
    }

    // Flatten pages
    return data.value.pages.flatMap((page) => {
      //

      return page.data.filter(isRenderablePost).flatMap((post, index) => {
        // TODO: Optimize performance

        return {
          ...post,

          // Custom meta data
          // Domain comes from the API
          // domain: savedPostsBooru.domain,

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
  const measureElement = (el: Element | ComponentPublicInstance | null) => {
    nextTick(() => {
      if (!(el instanceof Element)) {
        return
      }

      rowVirtualizer.value.measureElement(el)
    })
  }

  const virtualListTransform = computed(() => {
    const firstVirtualRowStart = virtualRows.value[0]?.start ?? 0
    return `translateY(${firstVirtualRowStart - rowVirtualizer.value.options.scrollMargin}px)`
  })

  function getPostRow(index: number): PostRow {
    const post = allRows.value[index]

    if (!post) {
      throw new Error(`Saved post row ${index} was not found`)
    }

    return post
  }

  /**
   * SEO
   */
  const shortTitle = computed(() => {
    const hasTags = selectedTags.value.length > 0
    const hasPaging = selectedPage.value !== savedPostsBooru.type.initialPageID

    let title = hasPaging ? t('posts.seo.pageOf', { page: selectedPage.value }) : ''

    if (hasTags) {
      const tagTitle = buildTagTitle(selectedTags.value)
      title += t('posts.seo.taggedHentai', { tags: tagTitle })
    } else {
      title += t('posts.seo.savedPosts')

      const filterParts: string[] = []
      if (selectedFilters.value.type) filterParts.push(t('posts.seo.typeOnly', { type: selectedFilters.value.type }))
      if (selectedFilters.value.rating) filterParts.push(t('posts.seo.rated', { rating: selectedFilters.value.rating }))
      if (selectedFilters.value.sort) filterParts.push(t('posts.seo.sortedBy', { sort: selectedFilters.value.sort }))
      if (selectedFilters.value.score) filterParts.push(t('posts.seo.scoreOf', { score: selectedFilters.value.score }))
      if (filterParts.length) title += ', ' + filterParts.join(', ')

      title += t('posts.seo.fromDomain', { domain: savedPostsBooru.domain })
    }

    return title.trim()
  })

  const titleForBody = computed(() => {
    const hasTags = selectedTags.value.length > 0

    if (hasTags) {
      const tagTitle = buildTagTitle(selectedTags.value)
      const title = t('posts.seo.tagsRule34', { tags: tagTitle })
      const filterParts: string[] = []
      if (selectedFilters.value.type) filterParts.push(t('posts.seo.typeOnly', { type: selectedFilters.value.type }))
      if (selectedFilters.value.rating) filterParts.push(t('posts.seo.rated', { rating: selectedFilters.value.rating }))
      if (selectedFilters.value.sort) filterParts.push(t('posts.seo.sortedBy', { sort: selectedFilters.value.sort }))
      if (selectedFilters.value.score) filterParts.push(t('posts.seo.scoreOf', { score: selectedFilters.value.score }))
      const full = filterParts.length ? `${title}, ${filterParts.join(', ')}` : title
      return full.charAt(0).toUpperCase() + full.slice(1)
    }

    const filterParts: string[] = []
    if (selectedFilters.value.type) filterParts.push(t('posts.seo.typeOnly', { type: selectedFilters.value.type }))
    if (selectedFilters.value.rating) filterParts.push(t('posts.seo.rated', { rating: selectedFilters.value.rating }))
    if (selectedFilters.value.sort) filterParts.push(t('posts.seo.sortedBy', { sort: selectedFilters.value.sort }))
    if (selectedFilters.value.score) filterParts.push(t('posts.seo.scoreOf', { score: selectedFilters.value.score }))
    if (!filterParts.length) return ''

    const joined = filterParts.join(', ')
    return joined.charAt(0).toUpperCase() + joined.slice(1)
  })

  useSeoMeta({
    title: shortTitle
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') },
        { name: t('common.savedPosts'), item: route.path }
      ]
    })
  ])

  definePageMeta({
    middleware: ['auth'],

    validate: async (route) => {
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
        :aria-label="t('common.searchPosts')"
        class="relative rounded-md p-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="toggleSearchMenu()"
      >
        <MagnifyingGlassIcon
          aria-hidden="true"
          class="h-6 w-6 text-base-content-highlight"
        />

        <!-- Highlighter -->
        <span
          v-if="selectedTags.length || Object.values(selectedFilters).some((value) => value !== undefined)"
          class="absolute top-0 right-0 flex h-2 w-2"
        >
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
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
        :model-value="savedPostsBooru"
        @update:model-value="onDomainChange"
      />

      <!-- TODO: Move filters here -->
    </section>

    <div class="flex">
      <PageHeader
        as="h2"
        class="flex-1"
      >
        <template #title>{{ t('common.savedPosts') }}</template>
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

          <h3>{{ t('posts.loadingPosts') }}</h3>
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

          <h3 class="text-lg leading-10 font-semibold">{{ t('posts.noResults') }}</h3>

          <span class="w-full overflow-x-auto text-pretty">{{ t('posts.tryChangingTagsOrFilters') }}</span>
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
              transform: virtualListTransform
            }"
            class="space-y-4"
          >
            <li
              v-for="virtualRow in virtualRows"
              :key="String(virtualRow.key)"
              :ref="measureElement"
              :data-index="virtualRow.index"
            >
              <!-- Next Pagination -->
              <div
                v-if="virtualRow.index > allRows.length - 1"
                class="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-base-content"
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
                  <template v-if="isFetching"> {{ t('posts.loadingMore') }} </template>

                  <template v-else-if="hasNextPage"> {{ t('posts.reachHereToLoadMore') }} </template>
                </span>
              </div>

              <!-- Content -->
              <template v-else>
                <!-- Page indicator -->
                <!-- TODO: Show individually, not attached to a post-->
                <button
                  v-if="virtualRow.index !== 0 && getPostRow(virtualRow.index).isFirstPost"
                  class="mx-auto mb-4 block rounded-md px-1.5 py-1 text-sm hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                  type="button"
                  @click="onPageIndicatorClick"
                >
                  &dharl; {{ $t('common.pageNumber', { page: getPostRow(virtualRow.index).current_page }) }} &dharr;
                </button>

                <!-- Post -->
                <!-- Fix: use domain + post.id as unique key, since virtualRow.index could be the same on different Boorus/pages -->
                <PostComponent
                  :key="getPostRow(virtualRow.index).domain + '-' + getPostRow(virtualRow.index).id"
                  :post="getPostRow(virtualRow.index)"
                  :post-index="virtualRow.index"
                  :selected-tags="selectedTags"
                  @add-tag="onPostAddTag"
                  @open-tag-in-new-tab="onPostOpenTagInNewTab"
                  @set-tag="onPostSetTag"
                />
              </template>
            </li>
          </ol>
        </div>

        <!-- Nothing more to load message -->
        <div
          v-if="!hasNextPage && !isFetching && allRows.length"
          class="mt-4 flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-base-content"
        >
          <span class="block rounded-md px-1.5 py-1"> {{ t('posts.nothingMoreToLoad') }} </span>
        </div>
      </div>
    </section>
  </main>
</template>
