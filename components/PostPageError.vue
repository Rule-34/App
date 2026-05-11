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
  const { t } = useI18n()
</script>

<template>
  <div class="text-center">
    <ExclamationCircleIcon
      aria-hidden="true"
      class="mx-auto mb-1 h-12 w-12"
    />

    <div v-if="error.status === 429">
      <h3 class="text-lg leading-10 font-semibold">{{ t('errors.tooManyRequests') }}</h3>

      <span class="w-full overflow-x-auto text-pretty">
        {{ t('errors.tooManyRequestsDescription', { name: project.name }) }}
      </span>

      <NuxtLink
        :href="config.public.apiUrl + '/status'"
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mx-auto mt-4 block w-fit rounded-md px-6 py-1.5 text-base ring-1 focus-visible:ring-offset-2"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        {{ t('errors.verifyNotBot') }}
      </NuxtLink>
    </div>

    <div v-else>
      <h3 class="text-lg leading-10 font-semibold">{{ t('errors.failedToLoadPosts') }}</h3>

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
      {{ t('errors.retry') }}
    </button>
  </div>
</template>
