<script setup>
  import DomainSelector from '~/pages/DomainSelector.vue'
  import { useBooruList } from '~/composables/useBooruList'
  import { ArrowPathIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { useStorage } from '@vueuse/core'

  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()
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
        },

        onResponseError(context) {
          // TODO: Toast
        }
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
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6 lg:px-8">
    <Teleport to="body">
      <ScrollTopButton />
    </Teleport>

    <main>
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
  </div>
</template>
