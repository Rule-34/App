<script setup>
  import { useUserSettings } from '~/composables/useUserSettings'
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'
  import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

  const props = defineProps({
    postName: {
      type: String,
      required: true
    },

    post: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['click-tag'])

  const userSettings = useUserSettings()

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
          data.file = props.post.high_res_file.url
          data.width = props.post.high_res_file.width
          data.height = props.post.high_res_file.height
        } else {
          // Return low res file
          data.file = props.post.low_res_file.url
          data.width = props.post.low_res_file.width ?? props.post.high_res_file.width
          data.height = props.post.low_res_file.height ?? props.post.high_res_file.height
        }

        break
      }

      case 'video': {
        data.file = props.post.high_res_file.url
        data.width = props.post.high_res_file.width
        data.height = props.post.high_res_file.height

        data.posterFile = props.post.preview_file.url
        break
      }

      default:
        throw new Error('Unknown media type: ' + props.post.media_type)
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
  <figure class="overflow-hidden rounded-md border border-base-0/20 shadow-lg">
    <PostMedia
      :mediaAlt="mediaFile.alt"
      :mediaSrc="mediaFile.file"
      :mediaSrcHeight="mediaFile.height"
      :mediaSrcWidth="mediaFile.width"
      :mediaType="post.media_type"
    />

    <Disclosure
      v-slot="{ open }"
      as="figcaption"
    >
      <!-- Actions -->
      <div class="flex items-center p-2">
        <PostSave :post="post" />

        <PostDownload
          :mediaName="postName"
          :mediaUrl="mediaFile.file"
        />

        <PostSource
          v-if="post.media_type === 'image'"
          :post-file-url="mediaFile.file"
          :post-sources="post.sources"
        />

        <DisclosureButton
          class="hover:hover-bg-util focus-visible:focus-util group ml-auto flex items-center gap-1 rounded-md px-1.5 py-1"
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
        </DisclosureButton>
      </div>

      <!-- Tags -->
      <DisclosurePanel
        as="ol"
        class="flex flex-wrap gap-2 p-2"
      >
        <li
          v-for="tag in tagsAsSingleArray"
          :key="tag.name"
        >
          <button
            :class="{
              'bg-primary-400/20 text-primary-400/90 ring-accent-400/20 hover:bg-primary-400/20': tag.type === 'artist',
              'bg-green-400/20 text-green-400/90 ring-green-400/20 hover:bg-green-400/20': tag.type === 'copyright',
              'bg-emerald-400/20 text-emerald-400/90 ring-emerald-400/20 hover:bg-emerald-400/20':
                tag.type === 'character',
              'hover:hover-bg-util': tag.type === 'general' || tag.type === 'meta'
            }"
            class="focus-visible:focus-util group inline-flex items-center rounded-full px-2 py-1 ring-1 ring-inset ring-base-0/20"
            type="button"
            @click="emit('click-tag', tag.name)"
          >
            <span class="group-hover:hover-text-util text-xs font-medium">
              {{ tag.name }}
            </span>
          </button>
        </li>
      </DisclosurePanel>
    </Disclosure>
  </figure>
</template>
