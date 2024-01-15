<script lang="ts" setup>
  const props = defineProps<{
    tags: {
      name: string
      path: string
      images: string[]
    }[]
  }>()

  const preselectedTags = useState('preselectedTags' + props.tags[0].path)

  callOnce(() => {
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
      v-for="tag in preselectedTags"
      :key="tag.name"
      class="max-w-[8rem] flex-shrink-0"
    >
      <NuxtLink
        :href="tag.path"
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util block rounded-md"
      >
        <figure>
          <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
          <img
            :alt="'Featured tag: ' + tag.name"
            :src="tag.images[0]"
            class="h-auto w-full rounded-t-md"
            height="600"
            loading="lazy"
            width="400"
          />

          <!-- Fix(not taking available width because of truncate): use negative margin -->
          <figcaption class="-mr-4 truncate px-1.5 py-1.5 text-center text-sm font-medium">
            {{ tag.name }}
          </figcaption>
        </figure>
      </NuxtLink>
    </li>
  </ol>
</template>
