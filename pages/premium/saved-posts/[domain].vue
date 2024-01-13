<script lang="ts" setup>
  import { db, type ISavedPost } from '~/store/SavedPosts'
  import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { useBooruList } from '~/composables/useBooruList'
  import type { Domain } from '~/assets/js/domain'
  import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import Tag from '~/assets/js/tag.dto'
  import { useInfiniteQuery } from '@tanstack/vue-query'
  import { toast } from 'vue-sonner'
  import { generatePostsRoute } from 'assets/js/RouterHelper'
  import type { IPostPageMeta } from 'assets/js/post'
  import { capitalize } from 'lodash-es'
  import { tagArrayToTitle } from 'assets/js/SeoHelper'

  const route = useRoute()
  const { booruList: _availableBooruList } = useBooruList()

  const booruNamesInDb = await db.posts.orderBy('original_domain').uniqueKeys()

  const booruList = computed(() => {
    const _booruList: Domain[] = [
      {
        domain: 'r34.app',
        type: booruTypeList[0],
        isPremium: false,
        config: null
      }
    ]

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

    return tags.split('|').map((tag) => new Tag({ name: tag }))
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
      rating: route.query.filter?.rating ?? undefined,
      sort: route.query.filter?.sort ?? undefined,
      score: route.query.filter?.score ?? undefined
    }
  })

  export interface ISavedPostPage {
    data: ISavedPost[]
    meta: IPostPageMeta
  }

  async function fetchPosts(options: any): Promise<ISavedPostPage> {
    const page = options.pageParam

    // TODO: Use userSettings
    const PAGE_SIZE = 30

    const posts = await db.posts
      //
      // Filter by domain
      .filter((post) => {
        if (selectedBooru.value.domain !== 'r34.app') {
          return post.original_domain === selectedBooru.value.domain
        }

        return true
      })
      //
      // .orderBy('created_at')
      .reverse()
      //
      // .limit(PAGE_SIZE)
      // .offset(page * PAGE_SIZE)
      //
      .toArray()

    return {
      data: posts,
      meta: {
        items_count: posts.length,
        total_items: posts.length,
        current_page: page,
        total_pages: null,
        items_per_page: PAGE_SIZE
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
    queryKey: ['saved-posts', selectedBooru, selectedTags, selectedFilters],
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

  async function onDomainChange(domain: Domain) {
    await reflectChangesInUrl({ domain: domain.domain, page: null, tags: null, filters: null })
  }

  /**
   * Adds the tag, or removes it if it already exists
   */
  async function onPostClickTag(tag: string) {
    let newTags = undefined

    const filteredSelectedTags = selectedTags.value.filter((selectedTag) => selectedTag.name !== tag)

    // If the tag was not found, add it
    if (filteredSelectedTags.length === selectedTags.value.length) {
      newTags = [...selectedTags.value, new Tag({ name: tag })]
    }

    // If the tag was found, remove it
    else {
      newTags = filteredSelectedTags
    }

    await reflectChangesInUrl({ page: null, tags: newTags, filters: null })
  }

  /**
   * Removes the tag, and adds it to the blocklist
   */
  async function onPostClickLongTag(tag: string) {
    const newTags = selectedTags.value.filter((selectedTag) => selectedTag.name !== tag)

    newTags.push(new Tag({ name: '-' + tag }))

    await reflectChangesInUrl({ page: null, tags: newTags, filters: null })
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
    const pagePrompt = prompt('What page number would you like to go to?', '10')
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

    referrer: 'no-referrer'
  })

  definePageMeta({
    middleware: 'auth',

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
  <!--  TODO: Search -->

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
        class="space-y-4"
      >
        <!-- TODO: Previous page -->

        <!-- Pages -->
        <div
          v-for="(postsPage, postsPageIndex) in data.pages"
          class="space-y-4"
          data-testid="posts-list"
        >
          <!-- Page indicator -->
          <button
            v-if="postsPageIndex !== 0"
            class="hover:hover-text-util hover:hover-bg-util focus-visible:focus-outline-util mx-auto block rounded-md px-1.5 py-1 text-sm"
            type="button"
            @click="onPageIndicatorClick"
          >
            &dharl; Page {{ postsPage.meta.current_page }} &dharr;
          </button>

          <!-- TODO: Animate adding posts https://vuejs.org/guide/built-ins/transition-group.html#staggering-list-transitions -->
          <ol class="space-y-4">
            <template
              v-for="(post, postIndex) in postsPage.data"
              :key="`${post.original_domain}-${post.original_id}`"
            >
              <li :data-testid="`${post.original_domain}-${post.original_id}`">
                <Post
                  :domain="post.original_domain"
                  :post="post.data"
                  :selected-tags="selectedTags"
                  @click-tag="onPostClickTag"
                  @click-long-tag="onPostClickLongTag"
                />
              </li>
            </template>
          </ol>
        </div>

        <!-- Next Pagination -->
        <PostsPagination @load-next-page="onLoadNextPostPage">
          <span v-if="isFetchingNextPage">Loading more&hellip;</span>
          <span v-else-if="hasNextPage">Reach here to load more</span>
          <span v-else>Nothing more to load</span>
        </PostsPagination>
      </div>
    </section>
  </main>
</template>
