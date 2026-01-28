<script lang="ts" setup>
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'
  import type { IPost } from '~/assets/js/post.dto'
  import Tag from '~/assets/js/tag.dto'
  import { project } from '@/config/project'

  const props = defineProps<{
    postIndex: number

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

  const currentUrl = useRequestURL()

  const { postFullSizeImages } = useUserSettings()
  const { isPremium } = useUserData()

  const areTagsOpen = ref(false)

  const mediaFile = computed(() => {
    const stripFragment = (url?: string | null) => url?.split('#')[0] ?? null

    const data: {
      file: IPost['high_res_file']['url']
      width: IPost['high_res_file']['width'] | null
      height: IPost['high_res_file']['height'] | null
      posterFile: IPost['preview_file']['url']
      alt: string
    } = {
      file: null,
      width: null,
      height: null,
      posterFile: null,
      alt: 'Post #' + props.post.id
    }

    switch (props.post.media_type) {
      case 'image': {
        // Return full image if its setting is enabled OR if low resolution file doesn't exist
        if (!props.post.low_res_file.url || postFullSizeImages.value) {
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

      case 'animated': {
        data.file = props.post.high_res_file.url
        data.width = props.post.high_res_file.width
        data.height = props.post.high_res_file.height

        data.posterFile = props.post.preview_file.url
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

    data.file = stripFragment(data.file)
    data.posterFile = stripFragment(data.posterFile)

    return data
  })

  // Only tagtypes that have at least one tag
  const tagTypesWithTags = computed(() => {
    return Object.keys(props.post.tags).filter((tagType) => props.post.tags[tagType].length > 0)
  })
</script>

<template>
  <figure class="border-base-0/20 rounded-md border">
    <PostMedia
      :mediaAlt="mediaFile.alt"
      :mediaPosterSrc="mediaFile.posterFile"
      :mediaSrc="mediaFile.file"
      :mediaSrcHeight="mediaFile.height"
      :mediaSrcWidth="mediaFile.width"
      :mediaType="post.media_type"
      :postIndex="props.postIndex"
    />

    <figcaption>
      <!-- Post description -->
      <span class="sr-only">
        {{ post.media_type }} #{{ post.id }}
        <!--        -->
        from {{ post.domain }}
        <!--        -->
        with a score of {{ post.score }},
        <!--        -->
        {{ post.rating }} rating,
        <!--        -->
        tagged with {{ Object.values(post.tags).flat().join(', ') }}
      </span>

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
          :post-file-url="post.media_type === 'video' ? mediaFile.posterFile : mediaFile.file"
          :post-sources="post.sources"
        />

        <PostChatWithAi
          v-if="!isPremium"
          :tags="post.tags"
        />

        <ShareButton
          :text="`Found on ${project.name}: ${currentUrl.href}`"
          :title="`Post #${post.id} from ${post.domain}`"
          :url="mediaFile.file ?? undefined"
          class="px-1.5 py-1"
        />

        <button
          class="hover:hover-bg-util focus-visible:focus-outline-util group ml-auto flex items-center gap-1 rounded-md px-1.5 py-1"
          type="button"
          @click="areTagsOpen = !areTagsOpen"
        >
          <span class="group-hover:hover-text-util text-base-content text-sm"> Tags </span>

          <ChevronDownIcon
            :class="{
              'rotate-180 transform': areTagsOpen,
              'rotate-0 transform': !areTagsOpen
            }"
            class="group-hover:hover-text-util text-base-content h-5 w-5"
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
              <h3 class="text-base-content-highlight text-lg leading-7 font-bold tracking-tight">
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

      <!-- Internal Links for Search Engines-->
      <div class="hidden">
        Tags:
        <template v-for="tagType in tagTypesWithTags">
          <template v-for="tag in post.tags[tagType]">
            <a :href="`/posts/${post.domain}?tags=${encodeURIComponent(tag)}`">{{ tag }}</a>
          </template>
        </template>
      </div>
    </figcaption>
  </figure>
</template>
