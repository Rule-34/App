<script lang="ts" setup>
  const props = defineProps<{
    tags: {
      name: string
      path: string
      images: string[]
    }[]
  }>()

  const tagsKey = props.tags[0].path

  const preselectedTags = useState('preselectedTags' + tagsKey)

  callOnce(tagsKey, () => {
    preselectedTags.value = props.tags.map((tag) => ({
      ...tag,
      images: [getRandomImage(tag.images)]
    }))
  })

  function getRandomImage(images: string[]) {
    return images[Math.floor(Math.random() * images.length)]
  }
</script>

<template>
  <ol class="scrollbar-hide flex gap-x-4 overflow-x-auto">
    <li
      v-for="(tag, index) in preselectedTags"
      :key="tag.name"
      class="max-w-[8rem] flex-shrink-0"
    >
      <NuxtLink
        :href="tag.path"
        :rel="tag.path.startsWith('http') ? 'noopener noreferrer nofollow' : ''"
        :target="tag.path.startsWith('http') ? '_blank' : ''"
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util block rounded-md"
      >
        <figure>
          <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
          <img
            :alt="'Featured tag: ' + tag.name"
            :loading="index > 5 ? 'lazy' : 'eager'"
            :src="tag.images[0]"
            class="h-auto w-full rounded-t-md"
            height="600"
            width="400"
          />

          <!-- Fix(not taking available width because of truncate): use negative margin -->
          <figcaption class="truncate py-1.5 text-center text-sm font-medium">
            {{ tag.name }}
          </figcaption>
        </figure>
      </NuxtLink>
    </li>
  </ol>
</template>
