<script lang="ts" setup>
  import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { Bars3BottomRightIcon, EyeIcon, PhotoIcon } from '@heroicons/vue/24/outline'
  import { useInfiniteQuery } from '@tanstack/vue-query'
  import { useWindowVirtualizer } from '@tanstack/vue-virtual'
  import type { IPost, IPostPage } from 'assets/js/post.dto'
  import { generatePostsRoute } from 'assets/js/RouterHelper'
  import { tagArrayToTitle } from 'assets/js/SeoHelper'
  import { capitalize } from 'lodash-es'
  import { toast } from 'vue-sonner'
  import type { Domain } from '~/assets/js/domain'
  import type { IPocketbasePost } from '~/assets/js/pocketbase.dto'
  import Post from '~/assets/js/post.dto'
  import Tag from '~/assets/js/tag.dto'
  import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import { useBooruList } from '~/composables/useBooruList'
  import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
  import type { Ref } from 'vue'

  const route = useRoute()

  const { $pocketBase } = useNuxtApp()

  const { toggle: toggleSearchMenu } = useSearchMenu()
  const userSettings = useUserSettings()
  const { booruList: _availableBooruList } = useBooruList()
  const { savedPostList } = usePocketbase()

  const domainsFromPocketbase = await $pocketBase.collection('distinct_original_domain_from_posts').getFullList()

  const booruList = computed(() => {
    const _booruList: Domain[] = [
      {
        domain: 'r34.app',
        type: booruTypeList[0],
        config: null,
        isCustom: false,
        isPremium: false
      }
    ]

    const booruNamesInDb: string[] = domainsFromPocketbase.map((domain) => domain.original_domain)

    booruNamesInDb.forEach((booruNameInDb) => {
      const booru = _availableBooruList.value.find((availableBooru) => availableBooru.domain === booruNameInDb)

      if (!booru) {
        throw new Error(`Booru with domain "${booruNameInDb}" not found`)
      }

      _booruList.push(booru)
    })

    return _booruList
  })

  const selectedBooru = computed(() => {
    let domain = route.params.domain

    // Fallback to first booru
    if (!domain) {
      domain = booruList.value[0].domain
    }

    const booru = booruList.value.find((booru) => booru.domain === domain)

    if (!booru) {
      toast.error(`Booru "${domain}" not found`)
      throw new Error(`Booru "${domain}" not found`)
    }

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
      return 0
    }

    return page
  })

  const selectedFilters = computed(() => {
    // TODO: Validate

    return {
      type: route.query.filter?.type ?? undefined,
      sort: route.query.filter?.sort ?? undefined,
      rating: route.query.filter?.rating ?? undefined
      // score: route.query.filter?.score ?? undefined
    }
  })

  const filterConfig = {
    type: {
      type: 'select' as const,
      label: 'Type',
      icon: PhotoIcon,
      options: [
        { label: 'Type', value: undefined },
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' }
      ]
    },
    sort: {
      type: 'select' as const,
      label: 'Sort',
      icon: Bars3BottomRightIcon,
      options: [
        { label: 'Sort', value: undefined },
        { label: 'Score', value: 'score' },
        { label: 'Score (asc)', value: 'score' },
        { label: 'Created', value: '-created' },
        { label: 'Created (asc)', value: 'created' },
        { label: 'Random', value: '@random' }
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
    }
  }

  interface IPostPageFromPocketBase extends Omit<IPostPage, 'links'> {}

  async function fetchPosts(options: any): Promise<IPostPageFromPocketBase> {
    const page = options.pageParam

    const PAGE_SIZE = userSettings.postsPerPage

    let pocketbaseRequestFilter = ''

    if (selectedBooru.value.domain !== 'r34.app') {
      pocketbaseRequestFilter += $pocketBase.filter('original_domain = {:original_domain}', {
        original_domain: selectedBooru.value.domain
      })
    }

    if (selectedFilters.value.type) {
      if (pocketbaseRequestFilter !== '') {
        pocketbaseRequestFilter += ' && '
      }

      pocketbaseRequestFilter += $pocketBase.filter('media_type = {:type}', {
        type: selectedFilters.value.type
      })
    }

    const pocketbaseRequestSort = selectedFilters.value.sort ?? '-created'

    if (selectedFilters.value.rating) {
      if (pocketbaseRequestFilter !== '') {
        pocketbaseRequestFilter += ' && '
      }

      pocketbaseRequestFilter += $pocketBase.filter('rating = {:rating}', {
        rating: selectedFilters.value.rating
      })
    }

    // TODO
    // if (selectedTags.value.length > 0) {
    // }

    // if (selectedFilters.value.score) {
    //   pocketbaseRequestFilter += $pocketBase.filter('score = {:score}', {
    //     score: selectedFilters.value.score
    //   })
    // }

    const pocketBasePostsResponse = await $pocketBase.collection('posts').getList<IPocketbasePost>(page, PAGE_SIZE, {
      sort: pocketbaseRequestSort,
      filter: pocketbaseRequestFilter,
      skipTotal: true
    })

    const posts = pocketBasePostsResponse.items.map((item) => {
      return Post.fromPocketbasePost(item)
    })

    return {
      data: posts,
      meta: {
        items_count: pocketBasePostsResponse.items.length,
        total_items: pocketBasePostsResponse.totalItems,
        current_page: pocketBasePostsResponse.page,
        total_pages: pocketBasePostsResponse.totalPages,
        items_per_page: pocketBasePostsResponse.perPage
      }
    }
  }

  const {
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
    queryKey: ['saved-posts', selectedBooru, selectedTags, selectedFilters, savedPostList.value.length],
    queryFn: fetchPosts,
    initialPageParam: selectedPage.value,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // If items are less than the limit, the end has been reached
      if (lastPage.meta.items_count !== lastPage.meta.items_per_page) {
        return undefined
      }

      // TODO: Use selectedPage.value instead of lastPageParam

      return lastPageParam + 1
    }
    // getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
    //   // Skip if page is 0 or less
    //   if (firstPageParam <= 0) {
    //     return undefined
    //   }
    //
    //   return firstPageParam - 1
    // }
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

      overscan: 5,

      gap: 16
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

    const postsRoute = generatePostsRoute('/premium/saved-posts', domain, page, tags, filters)

    await navigateTo({ ...postsRoute }, { replace })
  }

  const tagResults: Ref<Tag[]> = shallowRef([])

  async function onSearchTag(tag: string) {
    toast.error('Autocomplete not implemented')
  }

  async function onDomainChange(domain: Domain) {
    await reflectChangesInUrl({ domain: domain.domain, page: null, tags: null, filters: null })
  }

  async function onSearchSubmit({ tags, filters }) {
    await reflectChangesInUrl({ page: null, filters })
    // TODO: Tags
    //    await reflectChangesInUrl({ page: null, tags, filters })
  }

  /**
   * Adds the tag, or removes it if it already exists
   */
  async function onPostAddTag(tag: string) {
    toast.error('Not implemented')
  }

  /**
   * Sets tags to only the given tag
   */
  async function onPostSetTag(tag: string) {
    toast.error('Not implemented')
  }

  /**
   * Opens the tag in a new tab
   */
  async function onPostOpenTagInNewTab(tag: string) {
    toast.error('Not implemented')
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

  const title = computed(() => {
    let title = ''

    // Page
    if (selectedPage.value !== selectedBooru.value.type.initialPageID) {
      title += `Page ${selectedPage.value} of `
    }

    title += 'Saved Posts'

    // Tags
    if (selectedTags.value.length > 0) {
      title += ` tagged ${tagArrayToTitle(selectedTags.value)} porn`
    }

    // Filters

    if (selectedFilters.value.type) {
      title += `, ${selectedFilters.value.type} only`
    }

    if (selectedFilters.value.rating) {
      title += `, rated ${selectedFilters.value.rating}`
    }

    if (selectedFilters.value.sort) {
      title += `, sorted by ${selectedFilters.value.sort}`
    }

    if (selectedFilters.value.score) {
      title += `, with a score of ${selectedFilters.value.score}`
    }

    // Domain
    title += `, from ${selectedBooru.value.domain}`

    title = title.trim()
    title = capitalize(title)

    return title
  })

  const titleForBody = computed(() => {
    let _title = title.value

    // TODO: Show page number in body title
    _title = _title.replace(/Page \d+ of /, '')

    _title = _title.replace(/saved posts/i, '')

    _title = _title.replace(/ porn/, '')

    _title = _title.replace(/, from .+$/, '')

    // Edge case: ", sorted by" || ", rated" || ", with a score of"
    if (_title.startsWith(', ')) {
      _title = _title.slice(2)
    }

    _title = _title.trim()
    _title = capitalize(_title)

    return _title
  })

  useSeoMeta({
    title,

    referrer: () => {
      // Include referrer for specific Boorus
      if (!['danbooru.donmai.us'].includes(selectedBooru.value.domain)) {
        return 'no-referrer'
      }

      return 'strict-origin-when-cross-origin'
    }
  })

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
    </Teleport>
  </ClientOnly>

  <!-- Search menu -->
  <SearchMenuWrapper>
    <LazySearchMenu
      :initial-selected-filters="selectedFilters"
      :initial-selected-tags="selectedTags"
      :filter-config="filterConfig"
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
        <template #title>Saved Posts</template>
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
        <div class="flex h-80 w-full flex-col items-center justify-center gap-4 text-lg">
          <ExclamationCircleIcon class="h-12 w-12" />

          <h3>Failed to load posts</h3>

          <span class="w-full overflow-x-auto text-base">{{ error.message }}</span>
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
          <!-- TODO: Remove `space-y-4` when virtualizer gap works -->
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
                <PostComponent
                  :post="allRows[virtualRow.index]"
                  :selected-tags="selectedTags"
                  @addTag="onPostAddTag"
                  @openTagInNewTab="onPostOpenTagInNewTab"
                  @setTag="onPostSetTag"
                />
              </template>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </main>
</template>
