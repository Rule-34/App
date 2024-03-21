<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
  import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { PocketbasePost } from '~/assets/js/pocketbase.dto'
  import type { IPost } from '~/assets/js/post.dto'

  // TODO: Load this component in <suspense>

  const props = defineProps<{
    post: IPost
  }>()

  const { $pocketBase } = useNuxtApp()

  const { savedPostList } = usePocketbase()
  const { isPremium } = useUserData()

  const postInSavedList = computed(() => {
    return savedPostList.value.find(
      (savedPost) => savedPost.original_id === props.post.id && savedPost.original_domain === props.post.domain
    )
  })

  const isPostSaved = computed(() => {
    return !!postInSavedList.value
  })

  async function onClick() {
    if (!isPremium.value) {
      toast.info('Premium feature', {
        description: 'Save posts to your device and enjoy them later',
        duration: 10000
      })
      return
    }

    if (isPostSaved.value) {
      await deletePost()
    }
    //
    else {
      await savePost()
    }
  }

  async function savePost() {
    await $pocketBase
      .collection('posts')
      .create(PocketbasePost.fromPost(props.post, $pocketBase.authStore.baseModel.id))
  }

  async function deletePost() {
    await $pocketBase.collection('posts').delete(postInSavedList.value.id)
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
      v-if="isPostSaved"
      class="group-hover:hover-text-util h-5 w-5 text-base-content-highlight"
    />
    <BookmarkIcon
      v-else
      class="group-hover:hover-text-util h-5 w-5 text-base-content"
    />
  </button>
</template>
