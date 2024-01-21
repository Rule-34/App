<script lang="ts" setup>
  import { useUserSettings } from '~/composables/useUserSettings'
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'

  import { vOnLongPress } from '@vueuse/components'
  import Tag from '~/assets/js/tag.dto'
  import type { IPost } from '~/assets/js/post'
  import { toast } from 'vue-sonner'
  import { useAppStatistics } from '~/composables/useAppStatistics'

  const props = defineProps<{
    domain: string

    post: IPost

    selectedTags: Tag[]
  }>()

  const emit = defineEmits<{
    clickTag: [tag: string]
    clickLongTag: [tag: string]
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

  function onClickTag(tag: Tag) {
    emit('clickTag', tag.name)

    if (!tutorialLongClickTag.value) {
      toast.info('Browsing Tip', {
        description: 'Long click a tag to exclude it from search results',
        duration: 10000
      })

      tutorialLongClickTag.value = true
    }
  }

  function onClickLongTag(tag: Tag) {
    emit('clickLongTag', tag.name)
  }
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

        <!-- TODO: Add animation -->
        <template v-if="open">
          <PostDownload
            v-if="mediaFile.file"
            :mediaName="`${domain}-${post.id}`"
            :mediaUrl="mediaFile.file"
          />

          <PostSource
            v-if="post.media_type !== 'unknown'"
            :post-file-url="post.media_type === 'image' ? mediaFile.file : mediaFile.posterFile"
            :post-sources="post.sources"
          />
        </template>

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
          <button
            v-on-long-press.prevent.stop="() => onClickLongTag(tag)"
            :class="{
              'bg-primary-400/20 text-primary-400/90 ring-accent-400/20 hover:bg-primary-400/20': tag.type === 'artist',
              'bg-green-400/20 text-green-400/90 ring-green-400/20 hover:bg-green-400/20': tag.type === 'copyright',
              'bg-emerald-400/20 text-emerald-400/90 ring-emerald-400/20 hover:bg-emerald-400/20':
                tag.type === 'character',
              'hover:hover-bg-util': tag.type === 'general' || tag.type === 'meta',

              // Mark tag as selected
              'hover-bg-util hover-text-util !ring-base-0/20': selectedTags.some(
                (selectedTag) => selectedTag.name === tag.name
              )
            }"
            class="focus-visible:focus-outline-util group inline-flex items-center rounded-full px-2 py-1 ring-1 ring-inset ring-base-0/20"
            type="button"
            @click="onClickTag(tag)"
          >
            <span class="group-hover:hover-text-util text-xs font-medium">
              {{ tag.name }}
            </span>
          </button>
        </li>
      </HeadlessDisclosurePanel>
    </HeadlessDisclosure>
  </figure>
</template>
