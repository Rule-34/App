<script lang="ts" setup>
  import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/20/solid'
  import type { Domain } from '~/assets/js/domain'

  const props = defineProps<{ booru: Domain }>()

  const { t } = useI18n()

  const websiteUrl = computed(() => `${props.booru.config?.options?.HTTPScheme ?? 'https'}://${props.booru.domain}`)
  const label = computed(() => t('common.visitWebsite', { domain: props.booru.domain }))
</script>

<template>
  <a
    :href="websiteUrl"
    target="_blank"
    rel="noopener noreferrer nofollow"
    class="text-base-content-muted rounded-md p-1.5 hover:hover-bg-util hover:text-base-content-highlight focus-visible:focus-outline-util"
    :aria-label="label"
    :title="label"
  >
    <ArrowTopRightOnSquareIcon
      aria-hidden="true"
      class="h-4 w-4"
    />
  </a>
</template>
