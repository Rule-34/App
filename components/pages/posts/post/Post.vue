<script lang="ts" setup>
  import { useUserSettings } from '~/composables/useUserSettings'
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'
  import Tag from '~/assets/js/tag.dto'
  import type { IPost } from '~/assets/js/post'
  import { useAppStatistics } from '~/composables/useAppStatistics'

  const props = defineProps<{
    domain: string

    post: IPost

    selectedTags: Tag[]
  }>()

  // TODO: Find a better way to bubble events up
  /**
   * Events from child components
   * @see PostTag.vue
   */
  const emit = defineEmits<{
    addTag: [tag: string]
    setTag: [tag: string]
    openTagInNewTab: [tag: string]
  }>()

  const userSettings = useUserSettings()
  const { tutorialLongClickTag } = useAppStatistics()

  const mediaFile = computed(() => {
    const data = {
      file: null,
      width: null,
      height: null,
      posterFile: null,
      alt: 'Post with tags: ' + tagsAsSingleArray.value.map((tag) => tag.name).join(', ')
    }

    switch (props.post.media_type) {
      case 'image': {
        // Return full image if its setting is enabled OR if low resolution file doesn't exist
        if (!props.post.low_res_file.url || userSettings.postFullSizeImages) {
          data.file = 'https://imgproxy.permanent-link.com/pr:default/plain/' + props.post.high_res_file.url
          data.width = props.post.high_res_file.width
          data.height = props.post.high_res_file.height
        } else {
          // Return low res file
          data.file = 'https://imgproxy.permanent-link.com/pr:default/plain/' + props.post.low_res_file.url
          data.width = props.post.low_res_file.width ?? props.post.high_res_file.width
          data.height = props.post.low_res_file.height ?? props.post.high_res_file.height
        }

        break
      }

      case 'video': {
        data.file = props.post.high_res_file.url
        data.width = props.post.high_res_file.width
        data.height = props.post.high_res_file.height

        data.posterFile = 'https://imgproxy.permanent-link.com/pr:default/plain/' + props.post.preview_file.url
        break
      }

      default:
        data.file = props.post.high_res_file.url
        data.width = props.post.high_res_file.width
        data.height = props.post.high_res_file.height
    }

    return data
  })

  /**
   * Take in an object of tags like { character: ['tag1', 'tag2'], artist: ['tag3', 'tag4'] }
   * and return an array of tags like [{ name: 'tag1', type: 'character' }, { name: 'tag2', type: 'character' }, { name: 'tag3', type: 'artist' }, { name: 'tag4', type: 'artist' }]
   * @returns {Array<{ name: string, type: string }>}
   */
  const tagsAsSingleArray = computed(() => {
    const tags = []

    for (const [type, tagsArray] of Object.entries(props.post.tags)) {
      for (const tag of tagsArray) {
        tags.push({ name: tag, type })
      }
    }

    return tags
  })
</script>

<template>
  <figure class="rounded-md border border-base-0/20">
    <PostMedia
      :mediaAlt="mediaFile.alt"
      :mediaPosterSrc="mediaFile.posterFile"
      :mediaSrc="mediaFile.file"
      :mediaSrcHeight="mediaFile.height"
      :mediaSrcWidth="mediaFile.width"
      :mediaType="post.media_type"
    />

    <HeadlessDisclosure
      v-slot="{ open }"
      as="figcaption"
    >
      <!-- Actions -->
      <div class="flex items-center p-2">
        <PostSave
          v-if="mediaFile.file"
          :domain="domain"
          :post="post"
        />

        <PostDownload
          v-if="mediaFile.file"
          :mediaName="`${domain}-${post.id}`"
          :mediaUrl="mediaFile.file"
        />

        <PostSource
          :post-file-url="post.media_type === 'image' ? mediaFile.file : mediaFile.posterFile"
          :post-sources="post.sources"
        />

        <HeadlessDisclosureButton
          class="hover:hover-bg-util focus-visible:focus-outline-util group ml-auto flex items-center gap-1 rounded-md px-1.5 py-1"
          type="button"
        >
          <span class="group-hover:hover-text-util text-sm text-base-content"> Tags </span>

          <ChevronDownIcon
            :class="{
              'rotate-180 transform': open,
              'rotate-0 transform': !open
            }"
            class="group-hover:hover-text-util h-5 w-5 text-base-content"
          />
        </HeadlessDisclosureButton>
      </div>

      <!-- Tags -->
      <HeadlessDisclosurePanel
        as="ol"
        class="flex flex-wrap gap-2 p-2"
      >
        <li
          v-for="tag in tagsAsSingleArray"
          :key="tag.name"
        >
          <PostTag
            :selectedTags="selectedTags"
            :tag="tag"
            @addTag="emit('addTag', $event)"
            @openTagInNewTab="emit('openTagInNewTab', $event)"
            @setTag="emit('setTag', $event)"
          />
        </li>
      </HeadlessDisclosurePanel>
    </HeadlessDisclosure>
  </figure>
</template>
