<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
  import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/vue/24/solid'
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
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 2
      promptPremium.value = true
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
    const response = await $pocketBase
      .collection('posts')
      .create(PocketbasePost.fromPost(props.post, $pocketBase.authStore.baseModel.id))

    savedPostList.value = savedPostList.value.concat({
      id: response.id,

      original_domain: response.original_domain,
      original_id: response.original_id
    })
  }

  async function deletePost() {
    const response = await $pocketBase.collection('posts').delete(postInSavedList.value.id)

    if (response === true) {
      savedPostList.value = savedPostList.value.filter((savedPost) => savedPost.id !== postInSavedList.value.id)
    }
  }
</script>

<template>
  <button
    aria-label="Save post"
    class="hover:hover-bg-util focus-visible:focus-outline-util group rounded-md px-1.5 py-1"
    type="button"
    @click="onClick"
  >
    <SolidBookmarkIcon
      v-if="isPostSaved"
      class="group-hover:hover-text-util text-base-content-highlight h-5 w-5"
    />
    <BookmarkIcon
      v-else
      class="group-hover:hover-text-util text-base-content h-5 w-5"
    />
  </button>
</template>
