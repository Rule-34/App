<script lang='ts' setup>
import { useBooruList } from '~/composables/useBooruList'
import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { toast } from 'vue-sonner'
import Tag from '~/assets/js/tag.dto'
import type { Ref } from 'vue'
import { generatePostsRoute } from '~/assets/js/RouterHelper'
import { tagArrayToTitle } from '~/assets/js/SeoHelper'
import { capitalize } from 'lodash-es'
import type { Domain } from '~/assets/js/domain'
import type { IPostPage } from '~/assets/js/post'
import { useInfiniteQuery } from '@tanstack/vue-query'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const { token: authToken } = useAuth()

const { toggle: toggleSearchMenu } = useSearchMenu()
const userSettings = useUserSettings()
const { isPremium } = useUserData()
const { booruList } = useBooruList()
const { addListener } = usePageHistory()

addListener()

const { selectedDomainFromStorage } = useSelectedDomainFromStorage()

// TODO: Validate query - https://nuxt.com/docs/getting-started/routing#route-validation
const selectedBooru = computed(() => {
  let domain = route.query.domain

  // Fallback to first Booru
  if (!domain) {
    return booruList.value[0]
  }

  const booru = booruList.value.find((booru) => booru.domain === domain)

  if (!booru) {
    toast.error(`Booru "${ domain }" not found`)
    throw new Error(`Booru "${ domain }" not found`)
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

async function fetchPosts(options: any) {
  if (options.pageParam) {
    return $fetch<IPostPage>(options.pageParam, {
      headers: {
        'Authorization': authToken.value
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
      'Authorization': authToken.value
    },

    retry: false
  })
}

const {
  data,
  error,
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  isPending,
  isError
} = useInfiniteQuery({
  queryKey: ['posts', selectedBooru, selectedTags, selectedFilters],
  queryFn: fetchPosts,
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

// TODO: Virtualize posts or use a clever maxPages combination and scroll to last page end

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

  const postsRoute = generatePostsRoute(domain, page, tags, filters)

  await navigateTo({ ...postsRoute }, { replace })
}

const tagResults: Ref<Tag[]> = ref([])

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
      'Authorization': authToken.value
    },

    onResponseError(context) {
      if (context.response.status === 404) {
        tagResults.value = []
        return
      }

      toast.error(`Failed to load tags: "${ context.response.statusText }"`)
    }
  })

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

const title = computed(() => {
  let title = ''

  // Page
  if (selectedPage.value !== selectedBooru.value.type.initialPageID) {
    title += `Page ${ selectedPage.value } of `
  }

  title += 'Posts'

  // Tags
  if (selectedTags.value.length > 0) {
    title += ` tagged ${ tagArrayToTitle(selectedTags.value) } porn`
  }

  // Filters
  if (selectedFilters.value.rating) {
    title += `, rated ${ selectedFilters.value.rating }`
  }

  if (selectedFilters.value.sort) {
    title += `, sorted by ${ selectedFilters.value.sort }`
  }

  if (selectedFilters.value.score) {
    title += `, with a score of ${ selectedFilters.value.score }`
  }

  // Domain
  title += `, from ${ selectedBooru.value.domain }`

  title = title.trim()
  title = capitalize(title)

  return title
})

const titleForBody = computed(() => {
  let _title = title.value

  _title = _title.replace(/Page \d+ of /, '')

  _title = _title.replace(/posts/i, '')

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

  description: () => {
    let description = 'Stream and download porn images, GIFs and videos'

    if (selectedTags.value.length > 0) {
      description += ` featuring ${ tagArrayToTitle(selectedTags.value) }`
    }

    // TODO: Filters

    description += ` from the ${ selectedBooru.value.domain } website`

    description += '. Fast and free anime hentai with the Rule 34 App.'

    return description
  },

  referrer: 'no-referrer'
})

const canonicalUrl = computed(() => {
  const rawRoute = generatePostsRoute(
    selectedBooru.value.domain,
    selectedPage.value,
    selectedTags.value,
    selectedFilters.value
  )

  return 'https://' + config.public.APP_DOMAIN + router.resolve(rawRoute).href
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
    if (!route) {
      return true
    }

    const page = route.query.page

    // Check if `page` query is not an array, not null, and is a number
    if (!Array.isArray(page) && page != undefined) {
      const parsedPage = parseInt(page)

      if (Number.isNaN(parsedPage) || parsedPage < 0) {
        return false
      }
    }

    // Validate `domain` query
    // Validate `tags` query
    // Validate `filters` query

    return true
  }
})

// TODO: Create schema.org breadcrumb for posts page
</script>

<template>
  <!-- Search -->
  <SafeTeleport to='#navbar-actions'>
    <button
      class='focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2'
      type='button'
      @click='toggleSearchMenu()'
    >
      <span class='sr-only'>Search posts</span>

      <MagnifyingGlassIcon class='h-6 w-6 text-base-content-highlight' />

      <!-- Highlighter -->
      <span
        v-if='selectedTags.length || Object.values(selectedFilters).some((value) => value !== undefined)'
        class='absolute right-0 top-0 flex h-2 w-2'
      >
        <span class='relative inline-flex h-2 w-2 rounded-full bg-primary-600'></span>
      </span>
    </button>
  </SafeTeleport>

  <!-- Search menu -->
  <SearchMenuWrapper>
    <LazySearchMenu
      :initial-selected-filters='selectedFilters'
      :initial-selected-tags='selectedTags'
      :tag-results='tagResults'
      @submit='onSearchSubmit'
      @search-tag='onSearchTag'
    />
  </SearchMenuWrapper>

  <Teleport to='body'>
    <!-- Scroll to top -->
    <ScrollTopButton />
  </Teleport>

  <!-- Container -->
  <main class='container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8'>
    <section class='mb-4'>
      <DomainSelector
        :boorus='booruList'
        :model-value='selectedBooru'
        @update:model-value='onDomainChange'
      />

      <!-- TODO: Move filters here -->
    </section>

    <div class='flex'>
      <PageHeader class='flex-1'>
        <template #title>Posts</template>
        <template
          v-if='titleForBody'
          #text
        >
          <h2 class='text-sm'>
            <!-- TODO: Make tags and filters clickable so they open search menu, maybe reference the button, like a form does -->

            {{ titleForBody }}
          </h2>
        </template>
      </PageHeader>

      <!-- TODO: strip page -->
      <ShareButton
        :title='title'
        :url='canonicalUrl'
        class='my-auto'
        text=''
      />
    </div>

    <section class='my-4'>
      <!-- Pending -->
      <template v-if='isPending'>

        <div class='flex h-80 w-full animate-pulse flex-col items-center justify-center gap-4 text-lg'>
          <ArrowPathIcon class='h-12 w-12 animate-spin' />

          <h3>Loading posts&hellip;</h3>
        </div>
      </template>

      <!-- Error -->
      <template v-else-if='isError'>

        <div class='flex h-80 w-full flex-col items-center justify-center gap-4 text-lg'>
          <ExclamationCircleIcon class='h-12 w-12' />

          <h3>Failed to load posts</h3>

          <span class='w-full overflow-x-auto text-base'>{{ error.message }}</span>
        </div>
      </template>

      <!-- No results -->
      <template v-else-if='!data'>

        <div class='flex h-80 w-full flex-col items-center justify-center gap-4 text-lg'>
          <QuestionMarkCircleIcon class='h-12 w-12' />

          <h3>No results</h3>

          <span class='text-base'>Try changing the domain or the tags</span>
        </div>
      </template>

      <!-- Posts -->
      <div
        v-else
        class='space-y-4'
      >

        <!-- TODO: Previous page -->

        <!-- Pages -->
        <div
          v-for='(postsPage, postsPageIndex) in data.pages'
          class='space-y-4'
          data-testid='posts-list'
        >

          <!-- Page indicator -->
          <!-- TODO: Make clickable and change page -->
          <div
            v-if='postsPageIndex !== 0'
            class='text-center text-sm'
          >
            &dharl; Page {{ postsPage.meta.current_page }} &dharr;
          </div>

          <!-- TODO: Animate adding posts https://vuejs.org/guide/built-ins/transition-group.html#staggering-list-transitions -->
          <ol
            class='space-y-4'
          >
            <li
              v-for='(post, postIndex) in postsPage.data'
              :key='`post-${selectedBooru.domain}-${post.id}`'
            >
              <Post
                :post='post'
                :post-name='`${selectedBooru.domain}-${post.id}`'
                :selected-tags='selectedTags'
                @click-tag='onPostClickTag'
                @click-long-tag='onPostClickLongTag'
              />

              <!-- Promoted content -->
              <template v-if='!isPremium && postIndex !== 0 && postIndex % 7 === 0'>
                <PromotedContent class='my-4' />
              </template>
            </li>
          </ol>
        </div>

        <!-- Next Pagination -->
        <PostsPagination
          @load-next-page='onLoadNextPostPage'
        >
          <span v-if='isFetchingNextPage'>Loading more&hellip;</span>
          <span v-else-if='hasNextPage'>Reach here to load more</span>
          <span v-else>Nothing more to load</span>
        </PostsPagination>
      </div>
    </section>
  </main>
</template>
