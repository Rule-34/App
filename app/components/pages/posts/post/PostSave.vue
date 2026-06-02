<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
  import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/vue/24/solid'
  import type { IPost } from '~/assets/js/post.dto'

  // TODO: Load this component in <suspense>

  const props = defineProps<{
    post: IPost
  }>()

  const { getSavedPost, initializeInBackground, isInitialized, savePost, deleteSavedPost } = usePremiumCloudSync()
  const { isPremium } = useUserData()
  const canUseSavedPosts = computed(() => !isPremium.value || isInitialized.value)

  const postInSavedList = computed(() => {
    if (!canUseSavedPosts.value) {
      return undefined
    }

    return getSavedPost(props.post)
  })

  const isPostSaved = computed(() => {
    return !!postInSavedList.value
  })

  onMounted(() => {
    void initializeInBackground()
  })

  async function onClick() {
    if (!isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 2
      promptPremium.value = true
      return
    }

    if (!canUseSavedPosts.value) {
      return
    }

    if (isPostSaved.value) {
      await deleteCurrentSavedPost()
    }
    //
    else {
      await saveCurrentPost()
    }
  }

  async function saveCurrentPost() {
    await savePost(props.post)
  }

  async function deleteCurrentSavedPost() {
    const currentSavedPost = postInSavedList.value

    if (!currentSavedPost) {
      return
    }

    await deleteSavedPost(currentSavedPost.id)
  }
</script>

<template>
  <button
    :aria-label="isPostSaved ? $t('common.unsavePost') : $t('common.savePost')"
    :disabled="!canUseSavedPosts"
    class="group rounded-md px-1.5 py-1 hover:hover-bg-util focus-visible:focus-outline-util disabled:cursor-wait disabled:opacity-60"
    type="button"
    @click="onClick"
  >
    <SolidBookmarkIcon
      v-if="isPostSaved"
      class="h-5 w-5 text-base-content-highlight group-hover:hover-text-util"
    />
    <BookmarkIcon
      v-else
      class="h-5 w-5 text-base-content group-hover:hover-text-util"
    />
  </button>
</template>
