<script lang="ts" setup>
  import { Bars3BottomRightIcon, EyeIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { useInfiniteQuery } from '@tanstack/vue-query'
  import type { QueryFunctionContext } from '@tanstack/vue-query'
  import { useWindowVirtualizer } from '@tanstack/vue-virtual'
  import { cloneDeep, throttle } from 'es-toolkit'
  import { FetchError } from 'ofetch'
  import type { Ref } from 'vue'
  import { measureVirtualItemsAfterVueUpdate } from '~/assets/js/virtualizer-measurement'
  import {
    fallbackBooruDomain,
    generatePostsRoute,
    getFilterQueryValue,
    getSingleRouteParam,
    getSinglePositiveTagQueryValue,
    getSingleQueryValue
  } from '~/assets/js/RouterHelper'
  import { stripLocaleFromPath } from '~/composables/locale'
  import { useTagTitle } from '~/composables/useTagTitle'
  import type { Domain } from '~/assets/js/domain'
  import { isRenderablePost, type IPostPage, type IRenderablePost } from '~/assets/js/post.dto'
  import { shouldReportTagSearchError } from '~/assets/js/tag-search-error'
  import Tag, { type ITag } from '~/assets/js/tag.dto'
  import { project } from '~~/config/project'
  import { premiumPromotionIndices } from '~/composables/usePremiumDialog'

  type FilterValue = string | number | boolean | null | undefined
  type SearchSubmitPayload = {
    tags: Tag[]
    filters: Record<string, FilterValue>
  }
  type PostRow = IRenderablePost & {
    current_page: number
    isFirstPost: boolean
  }

  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const localePath = useLocalePath()
  const { t } = useI18n()
  const { toast } = useLazyToast()
  const buildTagTitle = useTagTitle()

  const { postsPerPage } = useUserSettings()
  const { isPremium } = useUserData()
  const { hasInteracted } = useInteractionDetector()
  const { schedule: scheduleIdleTask } = useIdleTask()
  const { booruList } = useBooruList()
  const { selectedBlockList } = useBlockLists()
  const { addUrlToPageHistory } = usePageHistory()
  const { value: isSearchMenuActive, toggle: toggleSearchMenu } = useSearchMenu()

  const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

  useHead({
    link: [
      { key: 'imgproxy-preconnect', rel: 'preconnect', href: project.imgproxy.baseUrl },
      { key: 'imgproxy-dns-prefetch', rel: 'dns-prefetch', href: project.imgproxy.baseUrl }
    ]
  })

  /**
   * Show ads for non-premium users
   */
  onMounted(() => {
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

  // Reopen the existing premium upsell when a non-premium user lands here
  // via redirect from a premium-only booru to the fallback booru route.
  onMounted(() => {
    if (isPremium.value) {
      return
    }

    if (selectedBooru.value.domain !== fallbackBooruDomain) {
      return
    }

    const sourceBooru = getSingleQueryValue(route.query.source_booru)

    if (!sourceBooru) {
      return
    }

    const { open: promptPremium, currentIndex } = usePremiumDialog()

    currentIndex.value = premiumPromotionIndices.additionalBoorus
    promptPremium.value = true
  })

  /**
   * URL
   */
  const selectedBooru = computed(() => {
    const domain = getSingleRouteParam(route.params.domain)

    const booru = booruList.value.find((booru) => booru.domain === domain)

    if (!booru) {
      toast.error(t('toasts.booruNotFound', { domain }))
      throw new Error(`Booru "${domain}" not found`)
    }

    return booru
  })

  watch(
    selectedBooru,
    (booru) => {
      selectedDomainFromStorage.value = booru.domain
    },
    { immediate: true }
  )

  const selectedTags = computed(() => {
    const tags = route.query.tags as string

    if (!tags) {
      return []
    }

    return tags.split('|').map((tag) => new Tag({ name: tag }).toJSON())
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
      rating: getFilterQueryValue(route.query, 'rating') ?? undefined,
      sort: getFilterQueryValue(route.query, 'sort') ?? undefined,
      score: getFilterQueryValue(route.query, 'score') ?? undefined
    }
  })

  const filterConfig = computed(() => ({
    sort: {
      type: 'select' as const,
      label: t('filters.sort'),
      icon: Bars3BottomRightIcon,
      options: [
        { label: t('filters.sort'), value: undefined },
        { label: t('filters.sortByScore'), value: 'score' },
        { label: t('filters.sortByCreated'), value: 'id' },
        { label: t('filters.sortByRandom'), value: 'random' }
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
  }))

  /**
   * Misc
   */
  const unregisterRouterAfterEach = router.afterEach((to) => {
    addUrlToPageHistory(stripLocaleFromPath(to.fullPath))
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

    filters?: Record<string, FilterValue> | null

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

    await navigateTo({ path: localePath(postsRoute.path), query: postsRoute.query }, { replace })
  }

  /**
   * Listeners
   */
  async function onSearchTag(tag: string) {
    let response: { data: ITag[] }

    try {
      response = await $fetch<{ data: ITag[] }>(`/booru/${selectedBooru.value.type.type}/tags`, {
        baseURL: config.public.apiUrl,

        params: {
          baseEndpoint: selectedBooru.value.domain,

          tag,
          order: 'count',
          limit: 20,

          // Booru options
          httpScheme: selectedBooru.value.config?.options?.HTTPScheme ?? undefined
        }
      })
    } catch (error) {
      if (shouldReportTagSearchError(error)) {
        const Sentry = await import('@sentry/nuxt')

        Sentry.captureException(error)
      }

      if (error instanceof FetchError) {
        switch (error.status) {
          case 404:
            toast.error(t('toasts.noTagsFound', { tag }))
            break

          case 429:
            // TODO: Cant always check if 429 is the status code, always show?
            toast.error(t('errors.tooManyRequests'), {
              description: t('toasts.rateLimitDescription'),
              action: {
                label: t('toasts.verifyNotBot'),
                onClick: () => window.open(config.public.apiUrl + '/status', '_blank', 'noopener,noreferrer')
              }
            })
            break

          default:
            toast.error(t('toasts.failedToLoadTags', { message: error.message }))
            break
        }
      } else {
        toast.error(t('toasts.failedToLoadTags', { message: String(error) }))
      }

      return
    }

    tagResults.value = response.data.map((tag) => new Tag(tag))
  }

  async function onDomainChange(domain: Domain) {
    await reflectChangesInUrl({ domain: domain.domain, page: null, tags: null, filters: null })
  }

  async function onSearchSubmit({ tags, filters }: SearchSubmitPayload) {
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
    const tagRoute = generatePostsRoute(
      undefined,
      selectedBooru.value.domain,
      undefined,
      [new Tag({ name: tag }).toJSON()],
      undefined
    )
    const path = localePath(tagRoute.path)
    window.open(router.resolve({ path, query: tagRoute.query }).href, '_blank', 'noopener,noreferrer')
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
  async function fetchPosts({ pageParam }: QueryFunctionContext<readonly unknown[], string>): Promise<IPostPage> {
    // Return early if selectedTags is in blocklist
    if (
      selectedBlockList.value.length > 0 &&
      //
      // selectedTags.value.some((tag) => selectedBlockList.value.includes(tag.name)) &&
      selectedBlockList.value.some((blocklistTag) => selectedTags.value.map((tag) => tag.name).includes(blocklistTag))
    ) {
      throw new Error(t('errors.tagInBlockList'))
    }

    if (pageParam) {
      return $fetch<IPostPage>(pageParam, {
        retry: false
      })
    }

    const apiUrl = `/booru/${selectedBooru.value.type.type}/posts`

    const tags = selectedTags.value.map((tag) => tag.name).join('|')

    return $fetch<IPostPage>(apiUrl, {
      baseURL: config.public.apiUrl,

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
  const postsQueryKey = [
    //
    'posts',
    //
    selectedBooru,
    selectedTags,
    selectedFilters,
    // Capture the initial page without tracking later ?page= progress updates
    // from infinite scroll. Making this reactive resets the appended list.
    selectedPage.value,
    //
    postsPerPage.value
  ]

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
    queryKey: postsQueryKey,

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

        if (!isRenderablePost(post)) {
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

    getNextPageParam: (lastPage, _allPages, _lastPageParam) => {
      if (lastPage.links.next == null) {
        return undefined
      }

      if (lastPage.meta.items_count === 0) {
        return undefined
      }

      return lastPage.links.next
    },

    getPreviousPageParam: (firstPage, _allPages, _firstPageParam) => {
      if (firstPage.links.prev == null) {
        return undefined
      }

      return firstPage.links.prev
    }
  })

  onServerPrefetch(suspense)

  /**
   * Virtualization
   */
  const estimatedRowSize = 600
  const rowGap = 16

  const allRows = computed<PostRow[]>(() => {
    if (!data.value) {
      return []
    }

    // Flatten pages
    return data.value.pages.flatMap((page) => {
      //

      return page.data.filter(isRenderablePost).flatMap((post, index) => {
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
  const isClientVirtualizerReady = ref(false)
  const virtualItemEls = useTemplateRef<HTMLElement[]>('virtualItemEls')

  onMounted(() => {
    parentOffsetRef.value = parentRef.value?.offsetTop ?? 0
    isClientVirtualizerReady.value = true
  })

  const rowVirtualizerOptions = computed(() => {
    return {
      count: hasNextPage.value ? allRows.value.length + 1 : allRows.value.length,

      getItemKey: (index: number) => {
        const post = allRows.value[index]

        return post ? getPostRowKey(post) : `${selectedBooru.value.domain}-next-page`
      },

      estimateSize: () => estimatedRowSize,

      // For SSR
      initialRect: {
        width: 800,
        height: 600
      },

      scrollMargin: parentOffsetRef.value,

      overscan: 5,

      gap: rowGap
    }
  })

  const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions)

  // Keep the server render and the client hydration pass identical. Once mounted,
  // TanStack Virtual can measure the real viewport and take over.
  const initialVirtualRows = computed(() => {
    const { count, initialRect, overscan } = rowVirtualizerOptions.value
    const visibleRows = Math.ceil(initialRect.height / estimatedRowSize)
    const rowCount = Math.min(count, visibleRows + overscan)

    return Array.from({ length: rowCount }, (_, index) => {
      const start = index * (estimatedRowSize + rowGap)
      const post = allRows.value[index]

      return {
        index,
        start,
        size: estimatedRowSize,
        end: start + estimatedRowSize,
        key: post ? getPostRowKey(post) : `${selectedBooru.value.domain}-next-page`,
        lane: 0
      }
    })
  })

  const initialTotalSize = computed(() => {
    const { count } = rowVirtualizerOptions.value

    return count > 0 ? count * estimatedRowSize + Math.max(0, count - 1) * rowGap : 0
  })

  const virtualRows = computed(() =>
    isClientVirtualizerReady.value ? rowVirtualizer.value.getVirtualItems() : initialVirtualRows.value
  )

  const totalSize = computed(() =>
    isClientVirtualizerReady.value ? rowVirtualizer.value.getTotalSize() : initialTotalSize.value
  )

  type RenderVirtualItem = (typeof virtualRows.value)[number]
  type RenderVirtualRow =
    | {
        kind: 'post'
        key: string
        virtualRow: RenderVirtualItem
        post: PostRow
        dataTestId: string
      }
    | {
        kind: 'next-page'
        key: string
        virtualRow: RenderVirtualItem
      }

  const renderRows = computed<RenderVirtualRow[]>(() =>
    virtualRows.value.map((virtualRow) => {
      const post = allRows.value[virtualRow.index]
      const key = String(virtualRow.key)

      if (!post) {
        return {
          kind: 'next-page',
          key,
          virtualRow
        }
      }

      return {
        kind: 'post',
        key,
        virtualRow,
        post,
        dataTestId: getPostRowKey(post)
      }
    })
  )

  function getPostRowKey(post: Pick<PostRow, 'domain' | 'id'>) {
    return `${post.domain}-${post.id}`
  }

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

  function measureVirtualRows() {
    measureVirtualItemsAfterVueUpdate({
      elements: virtualItemEls.value ?? [],
      virtualizer: rowVirtualizer.value
    })
  }

  onMounted(measureVirtualRows)
  onUpdated(measureVirtualRows)

  /**
   * Helper to translate filter values to localized labels
   */
  function getLocalizedFilterLabel(filterKey: string, filterValue: string): string {
    if (filterKey === 'sort') {
      const sortMapping: Record<string, string> = {
        score: t('filters.sortByScore'),
        id: t('filters.sortByCreated'),
        random: t('filters.sortByRandom')
      }
      return sortMapping[filterValue] || filterValue
    }

    if (filterKey === 'rating') {
      const ratingMapping: Record<string, string> = {
        safe: t('filters.ratingSafe'),
        general: t('filters.ratingGeneral'),
        sensitive: t('filters.ratingSensitive'),
        questionable: t('filters.ratingQuestionable'),
        explicit: t('filters.ratingExplicit')
      }
      return ratingMapping[filterValue] || filterValue
    }

    if (filterKey === 'score') {
      return filterValue
    }

    return filterValue
  }

  /**
   * Helper to build SEO filter parts from selectedFilters
   */
  function buildSeoFilterParts(
    filters: typeof selectedFilters.value,
    variant: 'default' | 'description' = 'default'
  ): string[] {
    const filterParts: string[] = []

    if (filters.rating) {
      filterParts.push(t('posts.seo.rated', { rating: getLocalizedFilterLabel('rating', filters.rating) }))
    }

    if (filters.sort) {
      filterParts.push(t('posts.seo.sortedBy', { sort: getLocalizedFilterLabel('sort', filters.sort) }))
    }

    if (filters.score) {
      if (variant === 'description') {
        filterParts.push(t('posts.seo.descriptionScoreOf', { score: getLocalizedFilterLabel('score', filters.score) }))
      } else {
        filterParts.push(t('posts.seo.scoreOf', { score: getLocalizedFilterLabel('score', filters.score) }))
      }
    }

    return filterParts
  }

  /**
   * SEO
   */
  const shortTitle = computed(() => {
    const hasTags = selectedTags.value.length > 0
    const hasPaging = selectedPage.value !== selectedBooru.value.type.initialPageID

    let title = hasPaging ? t('posts.seo.pageOf', { page: selectedPage.value }) : ''

    if (hasTags) {
      const tagTitle = buildTagTitle(selectedTags.value)
      title += t('posts.seo.taggedHentai', { tags: tagTitle })
    } else {
      title += t('posts.seo.posts')

      const filterParts = buildSeoFilterParts(selectedFilters.value)
      if (filterParts.length) title += ', ' + filterParts.join(', ')

      title += t('posts.seo.fromDomain', { domain: selectedBooru.value.domain })
    }

    return title.trim()
  })

  const titleForBody = computed(() => {
    const hasTags = selectedTags.value.length > 0

    if (hasTags) {
      const tagTitle = buildTagTitle(selectedTags.value)
      const title = t('posts.seo.tagsRule34', { tags: tagTitle })
      const filterParts = buildSeoFilterParts(selectedFilters.value)
      const full = filterParts.length ? `${title}, ${filterParts.join(', ')}` : title
      return full.charAt(0).toUpperCase() + full.slice(1)
    }

    const filterParts = buildSeoFilterParts(selectedFilters.value)
    if (!filterParts.length) return ''

    const joined = filterParts.join(', ')
    return joined.charAt(0).toUpperCase() + joined.slice(1)
  })

  const description = computed(() => {
    const tagsTitle = buildTagTitle(selectedTags.value)

    let desc = t('posts.seo.descriptionBase', { tags: tagsTitle ?? t('posts.seo.descriptionVarious') })

    const filterParts = buildSeoFilterParts(selectedFilters.value, 'description')
    if (filterParts.length) {
      desc += ', ' + filterParts.join(', ')
    }

    desc += t('posts.seo.fromDomain', { domain: selectedBooru.value.domain })
    desc += t('posts.seo.descriptionEnding', { name: project.shortName })

    return desc
  })

  useSeoMeta({
    title: shortTitle,

    description
  })

  // [TEMPORARY WORKAROUND] Override canonical for tagged post URLs.
  // i18n v10 strips query params on client hydration, so we re-apply or replace them.
  // Part 2 of a two-part fix — see server/plugins/fix-canonical-queries.ts
  // for the removal checklist.
  const canonicalUrl = computed(() => {
    const base = new URL(route.path, project.urls.production).href
    const tags = getSingleQueryValue(route.query.tags)

    if (!tags) return base

    const tagLandingTag = getSinglePositiveTagQueryValue(route.query.tags)
    const isSimpleSingleTagQuery = Object.keys(route.query).length === 1 && !Array.isArray(route.query.tags)

    if (tagLandingTag && isSimpleSingleTagQuery) {
      return new URL(`${route.path}/${encodeURIComponent(tagLandingTag)}`, project.urls.production).href
    }

    return `${base}?tags=${encodeURIComponent(tags)}`
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonicalUrl.value }]
  }))

  const firstPostsPageAsSchema = computed(() => {
    const firstPagePosts = data.value?.pages[0]?.data ?? []

    return firstPagePosts.slice(0, 8).map((post) => {
      if (post.media_type === 'video') {
        return defineVideo({
          url: post.high_res_file.url,
          thumbnailUrl: post.preview_file.url,
          height: post.high_res_file.height,
          width: post.high_res_file.width,
          isFamilyFriendly: false
        })
      }

      return defineImage({
        url: post.high_res_file.url,
        height: post.high_res_file.height,
        width: post.high_res_file.width,
        caption: [...post.tags.character, ...post.tags.copyright].join(', '),
        author: post.tags.artist.length ? post.tags.artist.join(', ') : undefined,
        isFamilyFriendly: false
      })
    })
  })

  useSchemaOrg(() => [
    defineWebPage({
      // @see https://unhead.unjs.io/schema-org/recipes/site-search#define-your-search-results-page
      '@type': ['CollectionPage', 'SearchResultsPage']
    }),

    defineBreadcrumb({
      // Breadcrumb items stay locale-relative; production-absolute URLs are reserved for canonicals.
      itemListElement: [
        {
          name: t('nav.home'),
          item: localePath('/')
        },
        {
          name: t('seo.postsFrom', { domain: selectedBooru.value.domain }),
          item: route.path
        }
      ]
    }),

    ...firstPostsPageAsSchema.value
  ])

  definePageMeta({
    middleware: [
      (to) => {
        const { booruList } = useBooruList()
        const { isPremium } = useUserData()
        const localePath = useLocalePath()

        if (isPremium.value) {
          return
        }

        const domain = Array.isArray(to.params.domain) ? to.params.domain[0] : to.params.domain

        if (!domain || domain === fallbackBooruDomain) {
          return
        }

        const booru = booruList.value.find((booru) => booru.domain === domain)

        if (!booru?.isPremium) {
          return
        }

        const tags = getSingleQueryValue(to.query.tags)
        const redirectQuery = {
          ...(tags ? { tags } : {}),
          utm_source: 'internal',
          utm_medium: 'unauthorized-booru-redirect',
          utm_campaign: 'additional-boorus',
          utm_content: domain,
          // Used after landing to reopen the existing premium upsell modal.
          source_booru: domain
        }

        return navigateTo(
          {
            path: localePath(`/posts/${fallbackBooruDomain}`),
            query: redirectQuery
          },
          {
            redirectCode: 302
          }
        )
      }
    ],

    validate: async (route) => {
      const { booruList } = useBooruList()

      const domain = route.params.domain

      const booru = booruList.value.find((booru) => booru.domain === domain)

      if (!booru) {
        return false
      }

      const page = route.query.page

      // Check if `page` query is not an array, not null, and is a number
      if (!Array.isArray(page) && page !== undefined && page !== null) {
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
        :aria-label="$t('common.searchPosts')"
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
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-600"></span>
        </span>
      </button>
    </Teleport>
  </ClientOnly>

  <!-- Search menu -->
  <LazySearchMenuWrapper v-if="isSearchMenuActive">
    <LazySearchMenu
      :filter-config="filterConfig"
      :initial-selected-filters="selectedFilters"
      :initial-selected-tags="selectedTags"
      :tag-results="tagResults"
      @submit="onSearchSubmit"
      @search-tag="onSearchTag"
    />
  </LazySearchMenuWrapper>

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
        <template #title>{{ $t('posts.title') }}</template>
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

      <ShareButton
        :title="shortTitle"
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
          <ol
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${(virtualRows[0]?.start ?? 0) - rowVirtualizer.options.scrollMargin}px)`
            }"
            data-testid="posts-list"
            class="space-y-4"
          >
            <li
              v-for="row in renderRows"
              :key="row.key"
              ref="virtualItemEls"
              :data-index="row.virtualRow.index"
              :data-virtual-key="row.key"
              :data-testid="row.kind === 'post' ? row.dataTestId : undefined"
            >
              <!-- Next Pagination -->
              <div
                v-if="row.kind === 'next-page'"
                data-testid="load-next-page"
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
                  v-if="row.virtualRow.index !== 0 && row.post.isFirstPost"
                  class="mx-auto mb-4 block rounded-md px-1.5 py-1 text-sm hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                  type="button"
                  @click="onPageIndicatorClick"
                >
                  &dharl; {{ $t('common.pageNumber', { page: row.post.current_page }) }} &dharr;
                </button>

                <!-- Post -->
                <PostComponent
                  :post="row.post"
                  :post-index="row.virtualRow.index"
                  :selected-tags="selectedTags"
                  @add-tag="onPostAddTag"
                  @open-tag-in-new-tab="onPostOpenTagInNewTab"
                  @set-tag="onPostSetTag"
                />

                <!-- Promoted content -->
                <template v-if="!isPremium && row.virtualRow.index !== 0 && row.virtualRow.index % 7 === 0">
                  <LazyPromotedContent class="mt-4" />
                </template>
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

    <PostsPageFooter
      v-if="!isPending && !isError && allRows.length"
      :posts-count="allRows.length"
      :selected-booru="selectedBooru"
      :selected-filters="selectedFilters"
      :selected-tags="selectedTags"
    />
  </main>
</template>
