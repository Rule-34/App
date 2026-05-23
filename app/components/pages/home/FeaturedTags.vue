<script lang="ts" setup>
  import { isExternalHref } from '~/composables/locale'

  type FeaturedTagMedia = {
    type: 'image' | 'iframe'
    src: string
  }

  type FeaturedTag = {
    name: string
    path: string
    isAdvertisement?: boolean
    media: FeaturedTagMedia[]
  }

  type PreselectedTag = FeaturedTag & {
    media: [FeaturedTagMedia]
  }

  const props = withDefaults(
    defineProps<{
      domain: string
      priorityCount?: number

      tags: FeaturedTag[]
    }>(),
    {
      priorityCount: 0
    }
  )

  const { t } = useI18n()
  const localePath = useLocalePath()

  const { isPremium } = useUserData()

  const tagsWithMedia = computed(() => props.tags.filter((tag) => tag.media.length > 0))
  const tagsKey = computed(
    () => 'preselectedTags:' + `${props.domain}:` + tagsWithMedia.value.map((tag) => tag.media.length).join('-')
  )

  const preselectedTags = useState<PreselectedTag[]>(tagsKey.value, () => [])

  callOnce(tagsKey.value, () => {
    preselectedTags.value = tagsWithMedia.value.map((tag) => ({
      ...tag,
      media: [getRandomMedia(tag.media)]
    }))
  })

  function getRandomMedia(media: FeaturedTagMedia[]): FeaturedTagMedia {
    const selectedMedia = media[Math.floor(Math.random() * media.length)]

    if (!selectedMedia) {
      throw new Error('Expected at least one featured tag media item')
    }

    return selectedMedia
  }

  function isPriorityMedia(index: number) {
    return index < props.priorityCount
  }

  function getFeaturedTagHref(path: string) {
    if (isExternalHref(path)) return path
    return localePath(path)
  }
</script>

<template>
  <ol class="scrollbar-hide grid grid-flow-col gap-4 overflow-x-auto">
    <template
      v-for="(tag, index) in preselectedTags"
      :key="tag.name"
    >
      <!-- Don't show advertisement if user is premium -->
      <li
        v-if="!tag.isAdvertisement || !isPremium"
        class="w-36"
      >
        <!-- -->

        <!-- Iframe -->
        <template v-if="tag.media[0].type === 'iframe'">
          <!-- -->

          <figure class="flex h-full flex-col">
            <!-- -->

            <iframe
              :loading="isPriorityMedia(index) ? 'eager' : 'lazy'"
              :src="tag.media[0].src"
              allow="autoplay"
              class="h-auto w-full grow rounded-t-md"
              credentialless="true"
              frameborder="0"
              height="600"
              marginheight="0"
              marginwidth="0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              scrolling="no"
              width="400"
            />

            <!-- Fix(not taking available width because of truncate): use negative margin -->
            <figcaption class="truncate py-1.5 text-center text-sm font-medium">
              {{ tag.name }}
            </figcaption>
          </figure>
        </template>

        <!-- Image -->
        <template v-else>
          <!-- -->

          <NuxtLink
            :href="getFeaturedTagHref(tag.path)"
            :rel="isExternalHref(tag.path) ? 'noopener noreferrer nofollow' : undefined"
            :target="isExternalHref(tag.path) ? '_blank' : undefined"
            class="block rounded-md hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          >
            <figure>
              <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
              <!-- Keep the default IPX provider here; it gives these local featured images better Nuxt Image sizing. -->
              <NuxtImg
                :alt="t('common.featuredTag', { name: tag.name })"
                :decoding="isPriorityMedia(index) ? undefined : 'async'"
                :fetchpriority="isPriorityMedia(index) ? undefined : 'low'"
                :loading="isPriorityMedia(index) ? 'eager' : 'lazy'"
                :preload="isPriorityMedia(index) ? { fetchPriority: 'high' } : false"
                :src="tag.media[0].src"
                class="h-auto w-full rounded-t-md"
                height="600"
                width="400"
              />

              <!-- Fix(not taking available width because of truncate): use negative margin -->
              <figcaption class="truncate-clip py-1.5 text-center text-sm font-medium">
                {{ tag.name }}
              </figcaption>
            </figure>
          </NuxtLink>
        </template>
      </li>
    </template>
  </ol>
</template>
