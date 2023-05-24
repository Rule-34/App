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

  const { selectedBooru } = useSelectedBooru()

  // Restore selected booru from query
  if (route.query.booru) {
    const booru = booruList.value.find((booru) => booru.domain === route.query.booru)

    if (booru) {
      selectedBooru.value = booru
    }
  }

  const {
    data: initialPosts,
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

          pageID: selectedBooru.value.type.initialPageID,

          tags: tags.length > 0 ? tags : undefined,

          // Filters
          rating: undefined,
          sort: undefined,
          score: '>=0' // TODO
        }
      })
    },
    {
      lazy: true,
      server: false
    }
  )

  const { posts, loadNextPosts, isThereNextPosts } = usePosts(initialPosts)

  // TODO: Virtualize posts
  // TODO: Restore popstate data
  watch(selectedBooru, async () => {
    // Reset unnecessary data
    selectedTags.value = []

    await refreshInitialPosts()

    if (errorInitialPosts.value) {
      return
    }

    await router.push(generatePostsRoute(selectedBooru.value.domain, undefined, selectedTags.value))
  })

  const selectedTags: Ref<Tag[]> = ref([])

  // Restore selected tags from query
  if (route.query.tags) {
    const tags = (route.query.tags as string)
      // Split by pipe
      .split('|')

      // Transform to objects
      .map((tag) => new Tag({ name: tag }))

    selectedTags.value = tags
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
        toast.error(`Failed to load tags: "${context.error.message}"`)
      }
    })

    tagResults.value = response.data
  }

  async function onSearchSubmit({ tags, filters }) {
    selectedTags.value = tags

    await refreshInitialPosts()
    // TODO: Reset values

    if (errorInitialPosts.value) {
      return
    }

    await router.push(generatePostsRoute(selectedBooru.value.domain, undefined, selectedTags.value))
  }

  async function onPostClickTag(tag: string) {
    selectedTags.value = [new Tag({ name: tag })]

    await refreshInitialPosts()

    if (errorInitialPosts.value) {
      return
    }

    await router.push(generatePostsRoute(selectedBooru.value.domain, undefined, selectedTags.value))
  }

  useHead({
    title: computed(() => {
      let title = ''

      if (selectedTags.value.length > 0) {
        title += ` ${tagArrayToTitle(selectedTags.value)}`
      }

      title += ` hentai from ${selectedBooru.value.domain}`

      title = title.trim()
      title = capitalize(title)

      return title
    }),

    meta: [
      {
        name: 'description',
        content: computed(() => {
          let description = 'Stream and download images, GIFs and videos'

          if (selectedTags.value.length > 0) {
            description += ` featuring ${tagArrayToTitle(selectedTags.value)}`
          }

          description += ' hentai'

          if (selectedBooru.value.domain) {
            description += ` from the ${selectedBooru.value.domain} website`
          }

          description += '. For free!'

          return description
        })
      },
      // Necessary so images can be loaded from other domains
      {
        name: 'referrer',
        content: 'no-referrer'
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
        v-model="selectedBooru"
        :boorus="booruList"
        class="mt-4"
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
        <template v-if="isThereNextPosts">
          <PostsPagination @load-next-page="loadNextPosts" />
        </template>
      </ol>
    </section>
  </main>
</template>
