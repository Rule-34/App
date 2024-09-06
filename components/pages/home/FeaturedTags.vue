<script lang="ts" setup>
  const props = defineProps<{
    tags: {
      name: string
      path: string
      media: {
        type: 'image' | 'iframe'
        src: string
      }[]
    }[]
  }>()

  const tagsKey = props.tags[0].path

  const preselectedTags = useState('preselectedTags' + tagsKey)

  callOnce(tagsKey, () => {
    preselectedTags.value = props.tags.map((tag) => ({
      ...tag,
      media: [getRandomMedia(tag.media)]
    }))
  })

  function getRandomMedia(media: { type: string; src: string }[]) {
    return media[Math.floor(Math.random() * media.length)]
  }
</script>

<template>
  <ol class="scrollbar-hide flex gap-x-4 overflow-x-auto">
    <li
      v-for="(tag, index) in preselectedTags"
      :key="tag.name"
      class="max-w-[8rem] flex-shrink-0"
    >
      <figure>
        <template v-if="tag.media[0].type === 'iframe'">
          <iframe
            :loading="index > 5 ? 'lazy' : 'eager'"
            :src="tag.media[0].src"
            allow="autoplay"
            class="h-auto w-full overflow-hidden rounded-t-md"
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
        </template>

        <template v-else>
          <NuxtLink
            :href="tag.path"
            :rel="tag.path.startsWith('http') ? 'noopener noreferrer nofollow' : ''"
            :target="tag.path.startsWith('http') ? '_blank' : ''"
            class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util block rounded-md"
          >
            <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
            <img
              :alt="'Featured tag: ' + tag.name"
              :loading="index > 5 ? 'lazy' : 'eager'"
              :src="tag.media[0].src"
              class="h-auto w-full rounded-t-md"
              height="600"
              width="400"
            />

            <!-- Fix(not taking available width because of truncate): use negative margin -->
            <figcaption class="truncate py-1.5 text-center text-sm font-medium">
              {{ tag.name }}
            </figcaption>
          </NuxtLink>
        </template>
      </figure>
    </li>
  </ol>
</template>
