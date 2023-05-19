<script setup>
  import DomainSelector from '~/pages/DomainSelector.vue'
  import { useBooruList } from '~/composables/useBooruList'
  import { ArrowPathIcon } from '@heroicons/vue/24/solid'
  import { useStorage } from '@vueuse/core'

  const config = useRuntimeConfig()
  const router = useRouter()
  const route = useRoute()

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
    data: posts,
    pending,
    error,
    refresh
  } = await useAsyncData(
    'posts',
    () => {
      const apiUrl = config.public.API_URL + '/booru/' + selectedBooru.value.type.type + '/posts'

      return $fetch(apiUrl, {
        params: {
          baseEndpoint: selectedBooru.value.domain,

          limit: userSettings.postsPerPage.value,
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

  // TODO: Virtualize posts
  // TODO: Restore popstate data
  watch(selectedBooru, async () => {
    await refresh()

    if (error.value) {
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

      <section class="mt-4">
        <!-- Pending -->
        <div
          v-if="pending"
          class="flex h-80 w-full animate-pulse flex-col items-center justify-center gap-4 text-lg"
        >
          <ArrowPathIcon class="h-12 w-12 animate-spin" />

          Loading posts&hellip;
        </div>

        <ol
          v-else-if="posts && posts.data.length"
          class="space-y-4"
        >
          <template
            v-for="(post, index) in posts.data"
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
        </ol>
      </section>
    </main>
  </div>
</template>
