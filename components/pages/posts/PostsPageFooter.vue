<script lang="ts" setup>
  import type { PropType } from 'vue'
  import type { Domain } from '~/assets/js/domain'
  import type { ITag } from '~/assets/js/tag.dto'
  import { normalizeStringForTitle } from '~/assets/js/SeoHelper'
  import { project } from '@/config/project'

  const props = defineProps({
    selectedBooru: {
      type: Object as PropType<Domain>,
      required: true
    },
    selectedTags: {
      type: Array as PropType<ITag[]>,
      default: () => []
    },
    selectedFilters: {
      type: Object,
      default: () => ({})
    },
    postsCount: {
      type: Number,
      default: 0
    }
  })

  const { booruList } = useBooruList()

  // Filter out the current booru to show related sites
  const relatedBoorus = computed(() => {
    return booruList.value.filter((booru) => booru.domain !== props.selectedBooru.domain).slice(0, 4)
  })

  // Computed properties for formatted tag displays
  const formattedTags = computed(() => {
    if (!props.selectedTags.length) {
      return ['Anime']
    }

    // Filter out excluded tags (those with a minus prefix)
    return props.selectedTags.filter((tag) => !tag.name.startsWith('-')).map((tag) => normalizeStringForTitle(tag.name))
  })

  const formattedTagsString = computed(() => formattedTags.value.join(', '))

  // Hardcoded related tags based on common combinations
  // These would be general enough to exist on most booru sites
  const hardcodedRelatedTags = ['highres', 'animated', 'cum', 'big_breasts', '1girl', '1boy']

  const formattedRelatedTags = computed(() => {
    return hardcodedRelatedTags.map((tag) => normalizeStringForTitle(tag))
  })
</script>

<template>
  <footer class="border-base-300/30 mt-5 border-t pt-8">
    <ShowMore :max-height-in-rem="16">
      <article class="richtext text-sm">
        <h2>Rule 34 {{ formattedTagsString }} hentai images and videos</h2>

        <section>
          <h3 v-if="selectedTags.length > 0">
            Exclusive {{ formattedTagsString }} Rule 34 gallery from {{ selectedBooru.domain }}
          </h3>
          <p>
            Browse our extensive collection of high-quality
            {{ formattedTagsString }} hentai, Rule 34, and anime parody artwork from {{ selectedBooru.domain }}. Our
            optimized platform provides real-time access to the latest lewd images, porn videos, and adult gifs directly
            from popular sources, with advanced filtering and search capabilities for the ultimate browsing experience.
            <template v-if="selectedTags.length > 0">
              Our library includes {{ selectedFilters.rating || 'explicit' }} rated adult media with
              {{ selectedFilters.sort ? `sorting by ${selectedFilters.sort}` : 'the most popular uploads' }}.
            </template>
            All Rule 34 images and videos are sourced directly from {{ selectedBooru.domain }}, ensuring the highest
            quality and most accurate tagging. Discover {{ postsCount > 0 ? postsCount + '+ ' : '' }}
            {{ selectedBooru.domain }} {{ formattedTagsString }} hentai illustrations, porn gifs, and XXX animations in
            one convenient location.
          </p>
        </section>

        <section>
          <h3>Why choose {{ project.shortName }} for {{ formattedTagsString }} hentai and Rule 34</h3>
          <ul>
            <li>Real-time adult image and porn video updates from original sources like {{ selectedBooru.domain }}</li>
            <li>Instant access to new Rule 34 artwork and anime parodies as they appear</li>
            <li>Mobile-optimized interface for on-the-go hentai viewing</li>
            <li>Advanced filtering system with precise tag searching for Rule 34 content</li>
            <li>Direct access to multiple porn booru sites in one place</li>
          </ul>
        </section>

        <section>
          <h3>Top {{ formattedTagsString }} related hentai tags</h3>
          <p>Explore these popular Rule 34 and adult anime related tags across all booru sites:</p>

          <nav class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="(tag, index) in hardcodedRelatedTags"
              :key="tag"
              :title="`Browse ${formattedRelatedTags[index]} hentai and Rule 34 images`"
              :to="`/posts/${selectedBooru.domain}?tags=${encodeURIComponent(tag)}`"
              class="text-primary text-sm hover:underline"
            >
              {{ formattedRelatedTags[index] }}
            </NuxtLink>
          </nav>
        </section>

        <section>
          <h3>More {{ formattedTagsString }} hentai sources</h3>
          <p>
            Expand your Rule 34 browsing experience with these alternative adult booru sites that offer similar lewd
            artwork:
          </p>

          <nav>
            <ul class="flex list-none flex-wrap gap-2">
              <li
                v-for="booru in relatedBoorus"
                :key="booru.domain"
              >
                <NuxtLink
                  :title="`Browse ${formattedTagsString} Rule 34 hentai on ${booru.domain}`"
                  :to="`/posts/${booru.domain}`"
                >
                  {{ booru.domain }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>

        <section>
          <h3>{{ formattedTagsString }} Rule 34 updates - always fresh hentai artwork</h3>
          <p>
            As a dedicated hentai viewer application, {{ project.shortName }} doesn't host adult media - we connect
            directly to {{ selectedBooru.domain }} and other popular Rule 34 sources. This means you're always seeing
            the newest {{ formattedTagsString }} porn images and adult videos in real-time, without any delay. New
            hentai artwork is refreshed instantly as it appears on the original sites, ensuring you never miss new
            additions to your favorite parody tags and anime categories.
          </p>
        </section>

        <section>
          <h3>
            How to find the best {{ formattedTagsString }} hentai videos and porn gifs on {{ selectedBooru.domain }}
          </h3>
          <p>
            Looking for the highest quality
            {{ formattedTagsString.toLowerCase() }} hentai and Rule 34 parody artwork? Use our advanced search and
            filtering options to discover exactly what you want. Sort adult images and XXX videos by rating, date, or
            popularity to find the newest and best-rated uploads. Our comprehensive Rule 34 tagging system allows for
            precise searches, ensuring you find exactly the lewd illustrations, porn gifs, and explicit videos you're
            looking for, the moment they're uploaded to {{ selectedBooru.domain }} and other popular adult sources.
          </p>
        </section>
      </article>
    </ShowMore>
  </footer>
</template>
