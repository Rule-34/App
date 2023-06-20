<script lang="ts" setup>
  import { db } from '~/store/SavedPosts'
  import { QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { useObservable } from '@vueuse/rxjs'
  import { liveQuery } from 'dexie'
  import { useBooruList } from '~/composables/useBooruList'

  const posts = await db.posts.toArray()

  const { booruList: _availableBooruList } = useBooruList()

  const _booruDomainsInDb = useObservable(
    //
    liveQuery(() =>
      //
      db.posts.orderBy('original_domain').uniqueKeys()
    ) as any,
    {
      initialValue: []
    }
  ) as Readonly<globalThis.Ref<unknown[]>>

  const booruList = computed(() => {
    return _booruDomainsInDb.value.map((domainInDb) => {
      const booru = _availableBooruList.value.find((availableBooru) => availableBooru.domain === domainInDb)

      if (!booru) {
        throw new Error(`Booru with domain "${domainInDb}" not found`)
      }

      return booru
    })
  })

  const selectedBooru = ref(undefined)

  const selectedTags = ref<string[]>([])

  function onDomainChange(domain: string) {
    // TODO
  }

  function onPostClickTag(tag: string) {
    // TODO
  }

  useSeoMeta({
    title: 'Saved posts'
  })

  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Saved posts</template>
      <template #text>Save posts to your device and enjoy them later</template>
    </PageHeader>

    <section
      v-if="booruList.length"
      class="mt-4"
    >
      <DomainSelector
        :boorus="booruList"
        :model-value="selectedBooru"
        class="mt-4"
        @update:model-value="onDomainChange"
      />
    </section>

    <section class="my-4">
      <!-- No results -->
      <template v-if="!posts.length">
        <!-- -->

        <div class="flex h-80 w-full flex-col items-center justify-center gap-4 text-lg">
          <QuestionMarkCircleIcon class="h-12 w-12" />

          <h1>No results</h1>

          <h2 class="text-base">Try changing the domain or the tags</h2>
        </div>
      </template>

      <template v-else>
        <!-- -->

        <ol class="space-y-4">
          <template
            v-for="(post, index) in posts"
            :key="post.id"
          >
            <!-- Post -->
            <li>
              <Post
                :post="post.data"
                :post-name="post.internal_id"
                :selected-tags="selectedTags"
                @click-tag="onPostClickTag"
              />
            </li>
          </template>
        </ol>

        <!-- Load more -->
        <!--        <template v-if="isThereNextPostPage">-->
        <!--          <PostsPagination-->
        <!--            class="mt-4"-->
        <!--            @load-next-page="onLoadNextPostPage"-->
        <!--          />-->
        <!--        </template>-->
      </template>
    </section>
  </main>
</template>
