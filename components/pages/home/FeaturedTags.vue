<script lang="ts" setup>
  import { isExternalHref } from '~/composables/locale'

  const props = withDefaults(
    defineProps<{
      domain: string
      priorityCount?: number

      tags: {
        name: string
        path: string
        isAdvertisement: boolean | undefined
        media: {
          type: 'image' | 'iframe'
          src: string
        }[]
      }[]
    }>(),
    {
      priorityCount: 0
    }
  )

  const { t } = useI18n()
  const localePath = useLocalePath()

  const { isPremium } = useUserData()
  const featuredTagsRef = ref<HTMLOListElement | null>(null)

  useDesktopHorizontalScroll(featuredTagsRef)

  const tagsWithMedia = computed(() => props.tags.filter((tag) => tag.media.length > 0))
  const tagsKey = computed(
    () => 'preselectedTags:' + `${props.domain}:` + tagsWithMedia.value.map((tag) => tag.media.length).join('-')
  )

  const preselectedTags = useState<typeof props.tags>(tagsKey.value)

  callOnce(tagsKey.value, () => {
    preselectedTags.value = tagsWithMedia.value.map((tag) => ({
      ...tag,
      media: [getRandomMedia(tag.media)]
    }))
  })

  function getRandomMedia(media: { type: string; src: string }[]) {
    return media[Math.floor(Math.random() * media.length)]
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
  <ol
    ref="featuredTagsRef"
    class="scrollbar-hide grid grid-flow-col gap-4 overflow-x-auto"
  >
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
            class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util block rounded-md"
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
