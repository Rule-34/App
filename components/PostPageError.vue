<script lang="ts" setup>
  import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
  import { project } from '@/config/project'

  interface Props {
    error: {
      status?: number
      data?: { message?: string }
      message?: string
    }
    onRetry: () => void
  }

  const props = defineProps<Props>()

  const config = useRuntimeConfig()
</script>

<template>
  <div class="text-center">
    <ExclamationCircleIcon
      aria-hidden="true"
      class="mx-auto mb-1 h-12 w-12"
    />

    <div v-if="error.status === 429">
      <h3 class="text-lg leading-10 font-semibold">Too many requests</h3>

      <span class="w-full overflow-x-auto text-pretty">
        You sent too many requests in a short period of time. Use the button below to continue using the
        {{ project.name }}
      </span>

      <NuxtLink
        :href="config.public.API_URL + '/status'"
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mx-auto mt-4 block w-fit rounded-md px-6 py-1.5 text-base ring-1 focus-visible:ring-offset-2"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        Verify I am not a Bot
      </NuxtLink>
    </div>

    <div v-else>
      <h3 class="text-lg leading-10 font-semibold">Failed to load posts</h3>

      <span class="w-full overflow-x-auto text-pretty">
        {{ error.data?.message ?? error.message }}
      </span>
    </div>

    <!-- Retry button -->
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mx-auto mt-6 block w-fit rounded-md px-6 py-1.5 text-base ring-1 focus-visible:ring-offset-2"
      type="button"
      @click="onRetry"
    >
      Retry
    </button>
  </div>
</template>
