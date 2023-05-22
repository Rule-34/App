<script setup>
  import DomainSelector from '~/pages/DomainSelector.vue'
  import { useBooruList } from '~/composables/useBooruList'
  import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { useStorage } from '@vueuse/core'
  import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'

  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()

  const { toggle: toggleSearchMenu } = useSearchMenu()
  const userSettings = useUserSettings()
  const { isPremium } = useUserData()
  const { booruList } = useBooruList()

  useHead({
    title: 'TODO',

    meta: [
      {
        name: 'description',
        content: 'TODO'
      },
      // Necessary so images can be loaded from other domains
      {
        name: 'referrer',
        content: 'no-referrer'
      }
    ]
  })

  // TODO: Refactor
  const selectedBooru = useStorage('user-selectedBooru', booruList.value[0], localStorage, {
    writeDefaults: false
  })

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

      return $fetch(apiUrl, {
        params: {
          baseEndpoint: selectedBooru.value.domain,

          limit: userSettings.postsPerPage,
          pageID: selectedBooru.value.type.initialPageID,
          tags: [], // TODO
          score: '>=0' // TODO
        },

        onResponse(context) {
          //
        }

        // onResponseError(context) {
        //   toast.error(`Failed to load initial posts: "${context.error.message}"`)
        // }
      })
    },
    {
      lazy: true,
      server: false,

      transform: (posts) => {
        posts.data = posts.data.filter((post) => {
          // Remove posts without a media file
          if (!post.high_res_file?.url) {
            return false
          }

          // Remove posts without a media type
          if (post.media_type === 'unknown') {
            return false
          }

          return true
        })

        return posts
      }
    }
  )

  const { posts, loadNextPosts, isThereNextPosts } = usePosts(initialPosts)

  // TODO: Virtualize posts
  // TODO: Restore popstate data
  watch(selectedBooru, async () => {
    await refreshInitialPosts()

    if (errorInitialPosts.value) {
      return
    }

    router.push(
      {
        query: {
          booru: selectedBooru.value.domain
        }
      },
      {
        posts
      }
    )
  })

  const selectedTags = ref([])

  // Restore selected tags from query
  if (route.query.tags) {
    const tags = route.query.tags
      // Split by pipe
      .split('|')

      // Transform to objects
      .map((tag) => {
        return {
          name: tag,
          count: null
        }
      })

    selectedTags.value = tags
  }

  const tagResults = ref([])

  async function searchTag(tag) {
    const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/tags'

    const response = await $fetch(apiUrl, {
      params: {
        baseEndpoint: selectedBooru.value.domain,

        tag,
        limit: 20
      },

      onResponseError(context) {
        toast.error(`Failed to load tags: "${context.error.message}"`)
      }
    })

    tagResults.value = response.data
  }
</script>

<template>
  <!-- Search -->
  <teleport to="#navbar-actions">
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
  </teleport>

  <!-- Search menu -->
  <SearchMenu
    :initial-selected-tags="selectedTags"
    :tag-results="tagResults"
    @submit="'TODO'"
    @search-tag="searchTag"
  />

  <Teleport to="body">
    <!-- Scroll to top -->
    <ScrollTopButton />
  </Teleport>

  <main class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6 lg:px-8">
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
            <Post
              :post="post"
              :post-name="`${selectedBooru.domain}-${post.id}`"
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
