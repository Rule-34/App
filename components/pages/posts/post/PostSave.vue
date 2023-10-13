<script lang='ts' setup>
import { BookmarkIcon } from '@heroicons/vue/24/outline'
import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/vue/24/solid'
import { IPost } from 'assets/js/post'
import { db } from '~/store/SavedPosts'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

// TODO: Load this component in <suspense>

const props = defineProps<{
  postId: string

  post: IPost
}>()

const postCount = useObservable(
  //
  liveQuery(() =>
    //
    db.posts
      .where('internal_id')
      .equals(props.postId)
      .count()
  ) as any,
  {
    initialValue: 0
  }
) as Readonly<globalThis.Ref<number>>

const isPostSaved = computed(() => postCount.value > 0)

async function onClick() {
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
  const originalDomain = props.postId.split('-')[0]

  await db.posts.put({
    internal_id: toRaw(props.postId),

    original_domain: originalDomain,

    data: toRaw(props.post)
  })
}

async function deletePost() {
  await db.posts.where('internal_id').equals(props.postId).delete()
}
</script>

<template>
  <button
    class='hover:hover-bg-util focus-visible:focus-outline-util group rounded-md px-1.5 py-1'
    type='button'
    @click='onClick'
  >
    <span class='sr-only'> Save post </span>

    <SolidBookmarkIcon
      v-if='isPostSaved > 0'
      class='group-hover:hover-text-util h-5 w-5 text-base-content-highlight'
    />
    <BookmarkIcon
      v-else
      class='group-hover:hover-text-util h-5 w-5 text-base-content'
    />
  </button>
</template>
