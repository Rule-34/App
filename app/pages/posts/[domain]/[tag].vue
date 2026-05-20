<script lang="ts" setup>
  import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
  import { fallbackBooruDomain, generatePostsRoute, getSingleRouteParam } from '~/assets/js/RouterHelper'
  import { normalizeStringForTitle } from '~/assets/js/SeoHelper'
  import type { IPost, IPostFile, IPostPage } from '~/assets/js/post.dto'
  import Tag, { TagDTO } from '~/assets/js/tag.dto'
  import { project } from '~~/config/project'

  const route = useRoute()
  const config = useRuntimeConfig()
  const localePath = useLocalePath()
  const { t } = useI18n()
  const { booruList } = useBooruList()

  type BooruHttpOptions = {
    HTTPScheme?: string
  }

  useHead({
    link: [
      { key: 'imgproxy-preconnect', rel: 'preconnect', href: project.imgproxy.baseUrl },
      { key: 'imgproxy-dns-prefetch', rel: 'dns-prefetch', href: project.imgproxy.baseUrl }
    ]
  })

  const domainParam = computed(() => getSingleRouteParam(route.params.domain))
  const tagParam = computed(() => getSingleRouteParam(route.params.tag))

  const selectedBooru = computed(() => {
    const booru = booruList.value.find((booru) => booru.domain === domainParam.value)

    if (!booru) {
      throw createError({ statusCode: 404, statusMessage: 'Booru not found' })
    }

    return booru
  })
  const formattedTag = computed(() => normalizeStringForTitle(tagParam.value) ?? tagParam.value)
  const selectedTags = computed(() => [new Tag(Object.assign(new TagDTO(), { name: tagParam.value })).toJSON()])
  const fullPostsRoute = computed(() =>
    generatePostsRoute('/posts', selectedBooru.value.domain, undefined, selectedTags.value)
  )

  const pageTitle = computed(() => {
    const title = `${t('posts.seo.tagsRule34', { tags: formattedTag.value })}${t('posts.seo.fromDomain', {
      domain: selectedBooru.value.domain
    })}`

    return title.charAt(0).toUpperCase() + title.slice(1)
  })
  const pageDescription = computed(
    () =>
      `${t('posts.seo.descriptionBase', { tags: formattedTag.value })}${t('posts.seo.fromDomain', {
        domain: selectedBooru.value.domain
      })}${t('posts.seo.descriptionEnding', { name: project.shortName })}`
  )

  const { data, error, pending } = await useAsyncData(
    () => `tag-landing:${selectedBooru.value.domain}:${tagParam.value}`,
    () =>
      $fetch<IPostPage>(`/booru/${selectedBooru.value.type.type}/posts`, {
        baseURL: config.public.apiUrl,
        params: {
          baseEndpoint: selectedBooru.value.domain,
          limit: 12,
          pageID: selectedBooru.value.type.initialPageID,
          tags: tagParam.value,
          httpScheme: (selectedBooru.value.config?.options as BooruHttpOptions | undefined)?.HTTPScheme ?? undefined
        },
        retry: false
      }),
    {
      deep: false
    }
  )

  const posts = computed<IPost[]>(() =>
    (data.value?.data ?? [])
      .filter((post) => post.media_type)
      .map((post) => ({
        ...post,
        domain: selectedBooru.value.domain
      }))
  )

  const canonicalUrl = computed(() => new URL(route.path, project.urls.production).href)

  const ogImageUrl = computed(() => {
    const firstPost = posts.value[0]
    if (!firstPost?.preview_file?.url) return undefined
    return firstPost.preview_file.url
  })

  function getPostPreviewFile(post: IPost): IPostFile {
    if (post.preview_file.url) return post.preview_file
    if (post.low_res_file.url) return post.low_res_file
    return post.high_res_file
  }

  function getPostPreviewAlt(post: IPost): string {
    const tags = [...post.tags.character, ...post.tags.copyright, ...post.tags.artist, ...post.tags.general].filter(
      Boolean
    )

    return tags.length ? tags.slice(0, 5).join(', ') : t('media.postAlt', { id: post.id })
  }

  function getPostAspectRatio(post: IPost): string {
    const previewFile = getPostPreviewFile(post)

    if (!previewFile.width || !previewFile.height) {
      return '2 / 3'
    }

    return `${previewFile.width} / ${previewFile.height}`
  }

  function isPriorityPost(index: number): boolean {
    return index === 0
  }

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogImage: ogImageUrl
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonicalUrl.value }]
  }))

  const firstPostsAsSchema = computed(() => {
    return posts.value.slice(0, 8).map((post) => {
      if (post.media_type === 'video') {
        return defineVideo({
          url: post.high_res_file.url,
          thumbnailUrl: post.preview_file.url,
          height: post.high_res_file.height,
          width: post.high_res_file.width,
          isFamilyFriendly: false
        })
      }

      return defineImage({
        url: post.high_res_file.url,
        height: post.high_res_file.height,
        width: post.high_res_file.width,
        caption: [...post.tags.character, ...post.tags.copyright].join(', '),
        author: post.tags.artist.length ? post.tags.artist.join(', ') : undefined,
        isFamilyFriendly: false
      })
    })
  })

  useSchemaOrg(() => [
    defineWebPage({
      '@type': ['CollectionPage', 'SearchResultsPage'],
      about: {
        '@type': 'Thing',
        name: formattedTag.value
      }
    }),

    defineBreadcrumb({
      // Breadcrumb items stay locale-relative; production-absolute URLs are reserved for canonicals.
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        {
          name: t('seo.postsFrom', { domain: selectedBooru.value.domain }),
          item: localePath(`/posts/${selectedBooru.value.domain}`)
        },
        { name: pageTitle.value, item: route.path }
      ]
    }),

    ...firstPostsAsSchema.value
  ])

  definePageMeta({
    middleware: [
      (to) => {
        const { booruList } = useBooruList()
        const { isPremium } = useUserData()
        const localePath = useLocalePath()
        const domain = getSingleRouteParam(to.params.domain)
        const tag = getSingleRouteParam(to.params.tag)

        if (isPremium.value || domain === fallbackBooruDomain) {
          return
        }

        const booru = booruList.value.find((booru) => booru.domain === domain)
        if (!booru?.isPremium) {
          return
        }

        return navigateTo(
          {
            path: localePath(`/posts/${fallbackBooruDomain}/${encodeURIComponent(tag)}`),
            query: {
              utm_source: 'internal',
              utm_medium: 'unauthorized-tag-booru-redirect',
              utm_campaign: 'additional-boorus',
              utm_content: domain,
              source_booru: domain
            }
          },
          { redirectCode: 302 }
        )
      }
    ],

    validate: async (route) => {
      const { booruList } = useBooruList()
      const domain = getSingleRouteParam(route.params.domain)
      const tag = getSingleRouteParam(route.params.tag)

      return Boolean(tag && booruList.value.some((booru) => booru.domain === domain))
    }
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>{{ pageTitle }}</template>
      <template #text>{{ pageDescription }}</template>
    </PageHeader>

    <div class="my-4 flex flex-wrap gap-2">
      <NuxtLink
        :to="localePath(fullPostsRoute)"
        class="rounded-md px-2 py-1 text-sm ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      >
        {{ t('posts.browseAllTaggedPosts', { tag: formattedTag }) }}
      </NuxtLink>

      <NuxtLink
        :to="localePath(`/posts/${selectedBooru.domain}`)"
        class="rounded-md px-2 py-1 text-sm ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      >
        {{ t('posts.moreFromDomain', { domain: selectedBooru.domain }) }}
      </NuxtLink>
    </div>

    <section class="my-4">
      <template v-if="pending">
        <div class="flex h-80 w-full animate-pulse flex-col items-center justify-center gap-4 text-lg">
          <ArrowPathIcon
            aria-hidden="true"
            class="h-12 w-12 animate-spin"
          />

          <h2>{{ t('posts.loadingPosts') }}</h2>
        </div>
      </template>

      <template v-else-if="error || !posts.length">
        <div class="mt-32 text-center">
          <QuestionMarkCircleIcon
            aria-hidden="true"
            class="mx-auto mb-1 h-12 w-12"
          />

          <h2 class="text-lg leading-10 font-semibold">{{ t('posts.noResults') }}</h2>
          <p class="w-full overflow-x-auto text-pretty">{{ t('posts.tryChangingTagsOrFilters') }}</p>
        </div>
      </template>

      <ol
        v-else
        class="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <li
          v-for="(post, index) in posts"
          :key="`${post.domain}-${post.id}`"
        >
          <NuxtLink
            :aria-label="t('media.postAlt', { id: post.id })"
            :to="localePath(fullPostsRoute)"
            class="block h-full rounded-md hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          >
            <figure class="h-full overflow-hidden rounded-md border border-base-0/20">
              <NuxtPicture
                v-if="getPostPreviewFile(post).url"
                :alt="getPostPreviewAlt(post)"
                :decoding="isPriorityPost(index) ? undefined : 'async'"
                :height="getPostPreviewFile(post).height ?? 600"
                :img-attrs="{
                  class: 'h-full w-full object-cover',
                  style: `aspect-ratio: ${getPostAspectRatio(post)}`
                }"
                :loading="isPriorityPost(index) ? 'eager' : 'lazy'"
                :preload="isPriorityPost(index) ? { fetchPriority: 'high' } : false"
                :src="getPostPreviewFile(post).url ?? undefined"
                :width="getPostPreviewFile(post).width ?? 400"
                provider="imgproxy"
              />

              <div
                v-else
                class="flex aspect-2/3 items-center justify-center bg-base-900 px-2 text-center text-sm"
              >
                {{ t('posts.noResults') }}
              </div>

              <figcaption class="px-2 py-1.5 text-xs">
                <span class="block truncate-clip">{{ getPostPreviewAlt(post) }}</span>
                <span class="block text-base-content/70">#{{ post.id }}</span>
              </figcaption>
            </figure>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <PostsPageFooter
      v-if="posts.length"
      :posts-count="posts.length"
      :selected-booru="selectedBooru"
      :selected-filters="{}"
      :selected-tags="selectedTags"
    />
  </main>
</template>
