<script lang='ts' setup>
import { db, ISavedPost } from '~/store/SavedPosts'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
import { useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { useBooruList } from '~/composables/useBooruList'
import type { Domain } from '~/assets/js/domain'
import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import Tag from '~/assets/js/tag.dto'


const { booruList: _availableBooruList } = useBooruList()

const booruNamesInDb = useObservable(
  //
  liveQuery(() =>
    //
    db.posts.orderBy('original_domain').uniqueKeys()
  ) as any,
  {
    initialValue: []
  }
) as Readonly<globalThis.Ref<ISavedPost['original_domain'][]>>

const booruList = computed(() => {
  const _booruList: Domain[] = [
    {
      domain: 'r34.app',
      type: booruTypeList[0],
      isPremium: false
    }
  ]

  booruNamesInDb.value.forEach((booruNameInDb) => {
    const booru = _availableBooruList.value.find((availableBooru) => availableBooru.domain === booruNameInDb)

    if (!booru) {
      throw new Error(`Booru with domain "${ booruNameInDb }" not found`)
    }

    _booruList.push(booru)
  })

  return _booruList
})

const selectedBooru = ref(toRaw(booruList.value[0]))

const selectedTags = ref<Tag[]>([])

const postsInDb = useObservable(
  //
  liveQuery(() =>
    db.posts.toArray()
  ) as any,
  {
    initialValue: []
  }
) as Readonly<globalThis.Ref<ISavedPost[]>>

const filteredPosts = computed(() => {
  let posts = postsInDb.value

  const currentDomain = selectedBooru.value.domain

  // Return all posts if selected booru is r34.app
  if (currentDomain && currentDomain === 'r34.app') {
    return posts
  }

  posts = posts.filter((post) => {
    if (currentDomain !== post.original_domain) {
      return false
    }

    return true
  })

  // TODO: Look for a search library to filter by tags and options

  posts = posts.toReversed()

  return posts
})

function onDomainChange(booru: Domain) {
  selectedBooru.value = booru

  // TODO: Save state in URL
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
  <main class='container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8'>
    <PageHeader>
      <template #title>Saved posts</template>
    </PageHeader>

    <section
      v-if='booruList.length'
      class='mt-4'
    >
      <DomainSelector
        :boorus='booruList'
        :model-value='selectedBooru'
        @update:model-value='onDomainChange'
      />
    </section>

    <section class='my-4'>
      <!-- No results -->
      <template v-if='!filteredPosts.length'>
        <!-- -->

        <div class='flex h-80 w-full flex-col items-center justify-center gap-4 text-lg'>
          <QuestionMarkCircleIcon class='h-12 w-12' />

          <h1>No results</h1>

          <h2 class='text-base'>Try changing the domain or the tags</h2>
        </div>
      </template>

      <template v-else>
        <!-- -->

        <ol class='space-y-4'>
          <template
            v-for='(post, index) in filteredPosts'
            :key='post.id'
          >
            <!-- Post -->
            <li>
              <Post
                :post='post.data'
                :post-name='post.internal_id'
                :selected-tags='selectedTags'
                @click-tag='onPostClickTag'
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
