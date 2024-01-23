<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
  import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/vue/24/solid'
  import { db } from '~/assets/js/SavedPosts'
  import { liveQuery } from 'dexie'
  import { useObservable } from '@vueuse/rxjs'
  import type { IPost } from '~/assets/js/post'
  import { toast } from 'vue-sonner'

  // TODO: Load this component in <suspense>

  const props = defineProps<{
    domain: string

    post: IPost
  }>()

  const { tutorialPostSave } = useAppStatistics()

  const postCount = useObservable(
    //
    liveQuery(() =>
      // TODO: .counts() and .exists() are not optimized - https://github.com/dexie/Dexie.js/releases/tag/v4.0.1-alpha.17
      db.posts.where('[original_domain+original_id]').equals([props.domain, props.post.id]).toArray()
    ),
    {
      initialValue: []
    }
  )

  const isPostSaved = computed(() => postCount.value.length > 0)

  async function onClick() {
    if (!tutorialPostSave.value) {
      toast.info('Saved post!', {
        description: 'Save posts to your device and enjoy them later',
        duration: 10000
      })

      tutorialPostSave.value = true
    }

    switch (isPostSaved.value) {
      case false: {
        await savePost()
        break
      }

      case true: {
        await deletePost()
        break
      }

      default:
        throw new Error('Unknown isPostSaved value: ' + isPostSaved.value)
    }
  }

  async function savePost() {
    await db.posts.put({
      original_id: toRaw(props.post.id),

      original_domain: props.domain,

      data: toRaw(props.post)
    })
  }

  async function deletePost() {
    await db.posts.where('[original_domain+original_id]').equals([props.domain, props.post.id]).delete()
  }
</script>

<template>
  <button
    class="hover:hover-bg-util focus-visible:focus-outline-util group rounded-md px-1.5 py-1"
    type="button"
    @click="onClick"
  >
    <span class="sr-only"> Save post </span>

    <SolidBookmarkIcon
      v-if="isPostSaved > 0"
      class="group-hover:hover-text-util h-5 w-5 text-base-content-highlight"
    />
    <BookmarkIcon
      v-else
      class="group-hover:hover-text-util h-5 w-5 text-base-content"
    />
  </button>
</template>
