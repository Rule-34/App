<script lang="ts" setup>
  import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
  import { project } from '~~/config/project'

  type PostPageDisplayError = {
    status?: number
    data?: { message?: string }
    message?: string
  }

  interface Props {
    error?: PostPageDisplayError | null
    onRetry: () => void
  }

  const props = defineProps<Props>()

  const config = useRuntimeConfig()
  const { t } = useI18n()
  const displayError = computed<PostPageDisplayError>(() => props.error ?? {})
  const statusUrl = computed(() => {
    if (config.public.apiUrl && URL.canParse('/status', config.public.apiUrl)) {
      return new URL('/status', config.public.apiUrl).href
    }

    return '/status'
  })
</script>

<template>
  <div class="text-center">
    <ExclamationCircleIcon
      aria-hidden="true"
      class="mx-auto mb-1 h-12 w-12"
    />

    <div v-if="displayError.status === 429">
      <h3 class="text-lg leading-10 font-semibold">{{ t('errors.tooManyRequests') }}</h3>

      <span class="w-full overflow-x-auto text-pretty">
        {{ t('errors.tooManyRequestsDescription', { name: project.name }) }}
      </span>

      <NuxtLink
        :href="statusUrl"
        class="mx-auto mt-4 block w-fit rounded-md px-6 py-1.5 text-base ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:ring-offset-2 focus-visible:focus-outline-util"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        {{ t('errors.verifyNotBot') }}
      </NuxtLink>
    </div>

    <div v-else>
      <h3 class="text-lg leading-10 font-semibold">{{ t('errors.failedToLoadPosts') }}</h3>

      <span class="w-full overflow-x-auto text-pretty">
        {{ displayError.data?.message ?? displayError.message }}
      </span>
    </div>

    <!-- Retry button -->
    <button
      class="mx-auto mt-6 block w-fit rounded-md px-6 py-1.5 text-base ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:ring-offset-2 focus-visible:focus-outline-util"
      type="button"
      @click="onRetry"
    >
      {{ t('errors.retry') }}
    </button>
  </div>
</template>
