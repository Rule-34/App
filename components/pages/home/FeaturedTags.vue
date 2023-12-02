<script lang="ts" setup>
  const props = defineProps<{
    tags: {
      name: string
      path: string
      images: string[]
    }[]
  }>()

  function getRandomImage(images: string[]) {
    return images[Math.floor(Math.random() * images.length)]
  }
</script>

<template>
  <ol
    class="scrollbar-hide flex gap-x-4 overflow-x-auto"
    v-bind="$attrs"
  >
    <li
      v-for="tag in tags"
      :key="tag.name"
      class="max-w-[8rem] flex-shrink-0"
    >
      <NuxtLink
        :href="tag.path"
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util block overflow-hidden rounded-md border border-transparent"
      >
        <figure>
          <NuxtImg
            :alt="'Featured tag: ' + tag.name"
            :src="getRandomImage(tag.images)"
            class="h-auto w-full"
            loading="lazy"
            style="aspect-ratio: 800/1200"
          />

          <figcaption class="truncate px-2 py-1.5 text-center text-sm font-medium">
            {{ tag.name }}
          </figcaption>
        </figure>
      </NuxtLink>
    </li>
  </ol>
</template>
