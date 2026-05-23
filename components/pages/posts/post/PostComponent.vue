<script lang="ts" setup>
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'
  import { generatePostTagLandingPath } from '~/assets/js/RouterHelper'
  import type { IPost } from '~/assets/js/post.dto'
  import Tag, { TagDTO } from '~/assets/js/tag.dto'
  import { project } from '@/config/project'

  const props = defineProps<{
    postIndex: number

    post: IPost

    selectedTags: Tag[]
  }>()

  /**
   * Build a descriptive alt attribute for media from the post's tags.
   * Prioritizes character > copyright > artist > general tags,
   * limited to the first 5 tags for a concise but meaningful description.
   * Falls back to "Post #id" if no tags are available.
   */
  function buildMediaAlt(post: IPost): string {
    const allTags = [...post.tags.character, ...post.tags.copyright, ...post.tags.artist, ...post.tags.general].filter(
      Boolean
    )

    const topTags = allTags.slice(0, 5)
    if (!topTags.length) {
      return t('media.postAlt', { id: post.id })
    }

    return topTags.join(', ')
  }

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

  const localePath = useLocalePath()
  const { t } = useI18n()

  type PostTagType = keyof IPost['tags']

  const tagTypeLabels = computed<Record<PostTagType, string>>(() => ({
    artist: t('tags.categories.artist'),
    character: t('tags.categories.character'),
    copyright: t('tags.categories.copyright'),
    general: t('tags.categories.general'),
    meta: t('tags.categories.meta')
  }))

  const { postFullSizeImages } = useUserSettings()
  const { isPremium } = useUserData()

  const areTagsOpen = ref(false)
  const isCollapsed = ref(false)

  function toggleCollapsedState() {
    isCollapsed.value = !isCollapsed.value

    if (!isCollapsed.value) {
      return
    }

    areTagsOpen.value = false
  }

  function createTag(name: string, type: PostTagType) {
    return new Tag(Object.assign(new TagDTO(), { name, type }))
  }

  function buildMediaDescriptionTags(post: IPost): string {
    const allTags = [...post.tags.character, ...post.tags.copyright, ...post.tags.artist, ...post.tags.general].filter(
      Boolean
    )

    return allTags.slice(0, 8).join(', ')
  }

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
      alt: buildMediaAlt(props.post)
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
  const tagTypesWithTags = computed<PostTagType[]>(() => {
    return (Object.keys(props.post.tags) as PostTagType[]).filter((tagType) => props.post.tags[tagType].length > 0)
  })

  const postSourceFileUrl = computed(() => {
    if (props.post.media_type === 'video') {
      return mediaFile.value.posterFile ?? mediaFile.value.file
    }

    return mediaFile.value.file
  })

  const collapsedSummary = computed(() => {
    const mediaLabel = props.post.media_type === 'animated' ? 'animation' : props.post.media_type

    return `${mediaLabel} #${props.post.id} hidden`
  })
</script>

<template>
  <figure class="border-base-0/20 rounded-md border">
    <div
      v-if="!isCollapsed"
      :title="`Double-click to hide post #${post.id}`"
      @dblclick="toggleCollapsedState"
    >
      <PostMedia
        :mediaAlt="mediaFile.alt"
        :mediaPosterSrc="mediaFile.posterFile"
        :mediaSrc="mediaFile.file"
        :mediaSrcHeight="mediaFile.height"
        :mediaSrcWidth="mediaFile.width"
        :mediaType="post.media_type"
        :postIndex="props.postIndex"
      />
    </div>

    <button
      v-else
      :aria-label="`Show post #${post.id}`"
      class="hover:hover-bg-util focus-visible:focus-outline-util text-base-content flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-t-md px-4 py-4 text-center"
      type="button"
      @click="toggleCollapsedState"
    >
      <span class="text-base-content-highlight text-sm font-semibold">{{ collapsedSummary }}</span>
      <span class="text-base-content/80 text-xs">Click to show it again</span>
    </button>

    <figcaption>
      <!-- Post description -->
      <span class="sr-only">
        {{
          $t('media.postDescription', {
            mediaType: post.media_type,
            id: post.id,
            domain: post.domain,
            score: post.score,
            rating: post.rating,
            tags: buildMediaDescriptionTags(post)
          })
        }}
      </span>

      <ClientOnly>
        <!-- Actions -->
        <div class="flex items-center p-2">
          <LazyPostSave
            v-if="mediaFile.file"
            :post="post"
          />

          <LazyPostDownload
            v-if="mediaFile.file"
            :mediaName="`${post.domain}-${post.id}`"
            :mediaUrl="post.high_res_file.url ?? post.low_res_file.url ?? mediaFile.file"
          />

          <LazyPostSource
            :post-file-url="postSourceFileUrl"
            :post-sources="post.sources"
          />

          <LazyShareButton
            :text="$t('media.shareFoundOn', { name: project.name, url: currentUrl.href })"
            :title="$t('media.sharePostTitle', { id: post.id, domain: post.domain })"
            :url="mediaFile.file ?? undefined"
            class="px-1.5 py-1"
          />

          <LazyPostChatWithAi
            v-if="!isPremium"
            :mediaType="post.media_type"
            :mediaUrl="post.high_res_file.url ?? post.low_res_file.url ?? (mediaFile.file as string)"
            :tags="post.tags"
          />

          <button
            class="hover:hover-bg-util focus-visible:focus-outline-util group ml-auto flex items-center gap-1 rounded-md px-1.5 py-1"
            type="button"
            @click="areTagsOpen = !areTagsOpen"
          >
            <span class="group-hover:hover-text-util text-base-content text-sm"> {{ $t('common.tags') }} </span>

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
        <LazyBottomSheetWrapper v-model="areTagsOpen">
          <!--  -->

          <div class="space-y-2 px-4 py-4">
            <!--  -->

            <template v-for="tagType of tagTypesWithTags">
              <!--  -->

              <div>
                <h3 class="text-base-content-highlight text-lg leading-7 font-bold tracking-tight">
                  {{ tagTypeLabels[tagType] }}
                </h3>

                <ol class="flex flex-wrap gap-2 p-2">
                  <li
                    v-for="tag in post.tags[tagType]"
                    :key="tag"
                  >
                    <LazyPostTag
                      :selectedTags="selectedTags"
                      :tag="createTag(tag, tagType)"
                      @addTag="emit('addTag', $event)"
                      @openTagInNewTab="emit('openTagInNewTab', $event)"
                      @setTag="emit('setTag', $event)"
                    />
                  </li>
                </ol>
              </div>
            </template>
          </div>
        </LazyBottomSheetWrapper>

        <template #fallback>
          <div
            aria-hidden="true"
            class="flex items-center p-2"
          >
            <PostSaveFallback v-if="mediaFile.file" />

            <PostDownloadFallback v-if="mediaFile.file" />

            <PostSourceFallback />

            <PostShareFallback />

            <PostChatWithAiFallback v-if="!isPremium" />

            <PostTagsToggleFallback />
          </div>
        </template>
      </ClientOnly>

      <!-- Internal Links for Search Engines-->
      <div class="hidden">
        Tags:
        <template v-for="tagType in tagTypesWithTags">
          <template v-for="tag in post.tags[tagType]">
            <a :href="localePath(generatePostTagLandingPath(post.domain, tag))">{{ tag }}</a>
          </template>
        </template>
      </div>
    </figcaption>
  </figure>
</template>
