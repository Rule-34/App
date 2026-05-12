<script lang="ts" setup>
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { IPost } from '~/assets/js/post.dto'
import Tag, { TagDTO } from '~/assets/js/tag.dto'
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

  function createTag(name: string, type: PostTagType) {
    return new Tag(Object.assign(new TagDTO(), { name, type }))
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
      alt: t('media.postAlt', { id: props.post.id })
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
        {{
          $t('media.postDescription', {
            mediaType: post.media_type,
            id: post.id,
            domain: post.domain,
            score: post.score,
            rating: post.rating,
            tags: Object.values(post.tags).flat().join(', ')
          })
        }}
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
          :mediaUrl="post.high_res_file.url ?? post.low_res_file.url ?? mediaFile.file"
        />

        <PostSource
          :post-file-url="postSourceFileUrl"
          :post-sources="post.sources"
        />

        <ShareButton
          :text="$t('media.shareFoundOn', { name: project.name, url: currentUrl.href })"
          :title="$t('media.sharePostTitle', { id: post.id, domain: post.domain })"
          :url="mediaFile.file ?? undefined"
          class="px-1.5 py-1"
        />

        <PostChatWithAi
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
      <BottomSheetWrapper v-model="areTagsOpen">
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
                  <PostTag
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
      </BottomSheetWrapper>

      <!-- Internal Links for Search Engines-->
      <div class="hidden">
        Tags:
        <template v-for="tagType in tagTypesWithTags">
          <template v-for="tag in post.tags[tagType]">
            <a :href="localePath(`/posts/${post.domain}?tags=${encodeURIComponent(tag)}`)">{{ tag }}</a>
          </template>
        </template>
      </div>
    </figcaption>
  </figure>
</template>
