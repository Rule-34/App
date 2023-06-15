<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
  import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { IPost } from 'assets/js/post'

  const props = defineProps<{
    post: IPost
  }>()

  const { isPremium } = useUserData()

  const isPostSaved = computed(() => false)

  function savePostLocally() {
    if (!isPremium.value) {
      toast.error('[Premium feature] save post so you can view it later!')
      return
    }

    // TODO: implement
  }
</script>

<template>
  <button
    class="hover:hover-bg-util focus-visible:focus-util group rounded-md px-1.5 py-1"
    type="button"
    @click="savePostLocally"
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
