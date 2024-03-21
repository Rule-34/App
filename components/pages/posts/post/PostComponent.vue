<script lang="ts" setup>
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'
  import type { IPost } from '~/assets/js/post.dto'
  import Tag from '~/assets/js/tag.dto'
  import { useUserSettings } from '~/composables/useUserSettings'

  const props = defineProps<{
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

  const areTagsOpen = ref(false)

  const mediaFile = computed(() => {
    const data = {
      file: null,
      width: null,
      height: null,
      posterFile: null,
      alt: 'Post #' + props.post.id
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

  // Only tagtypes that have at least one tag
  const tagTypesWithTags = computed(() => {
    return Object.keys(props.post.tags).filter((tagType) => props.post.tags[tagType].length > 0)
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

    <figcaption>
      <!-- Actions -->
      <div class="flex items-center p-2">
        <PostSave
          v-if="mediaFile.file"
          :post="post"
        />

        <PostDownload
          v-if="mediaFile.file"
          :mediaName="`${post.domain}-${post.id}`"
          :mediaUrl="mediaFile.file"
        />

        <PostSource
          :post-file-url="post.media_type === 'image' ? mediaFile.file : mediaFile.posterFile"
          :post-sources="post.sources"
        />

        <button
          class="hover:hover-bg-util focus-visible:focus-outline-util group ml-auto flex items-center gap-1 rounded-md px-1.5 py-1"
          type="button"
          @click="areTagsOpen = !areTagsOpen"
        >
          <span class="group-hover:hover-text-util text-sm text-base-content"> Tags </span>

          <ChevronDownIcon
            :class="{
              'rotate-180 transform': areTagsOpen,
              'rotate-0 transform': !areTagsOpen
            }"
            class="group-hover:hover-text-util h-5 w-5 text-base-content"
          />
        </button>
      </div>

      <!-- Tags -->
      <BottomSheetWrapper v-model="areTagsOpen">
        <!--  -->

        <div class="space-y-2 px-4 py-4">
          <!--  -->

          <template v-for="tagType of tagTypesWithTags">
            <!--  -->

            <div>
              <h3 class="text-lg font-bold leading-7 tracking-tight text-base-content-highlight">
                {{ tagType.charAt(0).toUpperCase() + tagType.slice(1) }}
              </h3>

              <ol
                as="ol"
                class="flex flex-wrap gap-2 p-2"
              >
                <li
                  v-for="tag in post.tags[tagType]"
                  :key="tag"
                >
                  <PostTag
                    :selectedTags="selectedTags"
                    :tag="new Tag({ name: tag, type: tagType })"
                    @addTag="emit('addTag', $event)"
                    @openTagInNewTab="emit('openTagInNewTab', $event)"
                    @setTag="emit('setTag', $event)"
                  />
                </li>
              </ol>
            </div>
          </template>
        </div>
      </BottomSheetWrapper>
    </figcaption>
  </figure>
</template>
