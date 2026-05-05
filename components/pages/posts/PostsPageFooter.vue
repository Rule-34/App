<script lang="ts" setup>
import type { PropType } from 'vue'
import type { Domain } from '~/assets/js/domain'
import type { ITag } from '~/assets/js/tag.dto'
import { normalizeStringForTitle } from '~/assets/js/SeoHelper'
import { project } from '@/config/project'

interface SelectedFilters {
    rating?: string
    sort?: string
    score?: string
  }

  const RELATED_TAGS = ['highres', 'animated', 'cum', 'big_breasts', '1girl', '1boy']

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
      type: Object as PropType<SelectedFilters>,
      default: () => ({})
    },
    postsCount: {
      type: Number,
      default: 0
    }
  })

  const { t } = useI18n()
  const localePath = useLocalePath()
  const { booruList } = useBooruList()

  const relatedBoorus = computed(() =>
    booruList.value.filter((b) => b.domain !== props.selectedBooru.domain).slice(0, 4)
  )

  const includedTags = computed(() =>
    props.selectedTags
      .filter((tag) => !tag.name.startsWith('-'))
      .map((tag) => normalizeStringForTitle(tag.name))
      .filter((s): s is string => s != null && s !== '')
  )

  const hasTags = computed(() => includedTags.value.length > 0)

  const formattedTags = computed(() =>
    includedTags.value.length > 0 ? includedTags.value : [t('seoFooter.defaultTag')]
  )

  const formattedTagsString = computed(() => formattedTags.value.join(', '))

  const formattedTagsLower = computed(() => formattedTagsString.value.toLowerCase())

  const formattedRelatedTags = computed(() => RELATED_TAGS.map((tag) => normalizeStringForTitle(tag)))

  const ratingLabel = computed(() => {
    const raw = (props.selectedFilters.rating || 'explicit').toLowerCase()
    const key = `filters.rating${raw.charAt(0).toUpperCase() + raw.slice(1)}`
    const translated = t(key)
    return translated === key ? t('filters.ratingExplicit') : translated
  })

  const formattedCount = computed(() => (props.postsCount > 0 ? `${props.postsCount}+ ` : ''))

  const sortLabel = computed(() => {
    if (!props.selectedFilters.sort) return t('seoFooter.mostPopularUploads')
    const raw = props.selectedFilters.sort.toLowerCase()
    const key = `filters.sortBy${raw.charAt(0).toUpperCase() + raw.slice(1)}`
    const translatedSort = t(key)
    if (translatedSort === key) return t('seoFooter.mostPopularUploads')
    return t('seoFooter.sortingBy', { sort: translatedSort })
  })
</script>

<template>
  <footer class="border-base-300/30 mt-5 border-t pt-8">
    <ShowMore :max-height-in-rem="16">
      <article class="richtext text-sm">
        <h2>{{ $t('seoFooter.h2', { tags: formattedTagsString }) }}</h2>

        <section>
          <h3 v-if="hasTags">
            {{ $t('seoFooter.exclusiveGalleryH3', { tags: formattedTagsString, domain: selectedBooru.domain }) }}
          </h3>
          <p>
            {{ $t('seoFooter.browseCollectionP1', { tags: formattedTagsString, domain: selectedBooru.domain }) }}
            <template v-if="hasTags">
              {{ $t('seoFooter.libraryIncludes', { rating: ratingLabel, sort: sortLabel }) }}
            </template>
            {{
              $t('seoFooter.allSourcedP2', {
                domain: selectedBooru.domain,
                count: formattedCount,
                tags: formattedTagsString
              })
            }}
          </p>
        </section>

        <section>
          <h3>{{ $t('seoFooter.whyChooseH3', { name: project.shortName, tags: formattedTagsString }) }}</h3>
          <ul>
            <li>{{ $t('seoFooter.featureRealTime', { domain: selectedBooru.domain }) }}</li>
            <li>{{ $t('seoFooter.featureInstant') }}</li>
            <li>{{ $t('seoFooter.featureMobile') }}</li>
            <li>{{ $t('seoFooter.featureFiltering') }}</li>
            <li>{{ $t('seoFooter.featureDirect') }}</li>
          </ul>
        </section>

        <section>
          <h3>{{ $t('seoFooter.relatedTagsH3', { tags: formattedTagsString }) }}</h3>
          <p>{{ $t('seoFooter.relatedTagsIntro') }}</p>

          <nav class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="(tag, index) in RELATED_TAGS"
              :key="tag"
              :title="$t('seoFooter.relatedTagTitle', { tag: formattedRelatedTags[index] })"
              :to="localePath(`/posts/${selectedBooru.domain}?tags=${encodeURIComponent(tag)}`)"
              class="text-primary text-sm hover:underline"
            >
              {{ formattedRelatedTags[index] }}
            </NuxtLink>
          </nav>
        </section>

        <section>
          <h3>{{ $t('seoFooter.moreSourcesH3', { tags: formattedTagsString }) }}</h3>
          <p>{{ $t('seoFooter.moreSourcesIntro') }}</p>

          <nav>
            <ul class="flex list-none flex-wrap gap-2">
              <li
                v-for="booru in relatedBoorus"
                :key="booru.domain"
              >
                <NuxtLink
                  :title="$t('seoFooter.sourceLinkTitle', { tags: formattedTagsString, domain: booru.domain })"
                  :to="localePath(`/posts/${booru.domain}`)"
                >
                  {{ booru.domain }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>

        <section>
          <h3>{{ $t('seoFooter.updatesH3', { tags: formattedTagsString }) }}</h3>
          <p>
            {{
              $t('seoFooter.updatesP', {
                name: project.shortName,
                domain: selectedBooru.domain,
                tags: formattedTagsString
              })
            }}
          </p>
        </section>

        <section>
          <h3>{{ $t('seoFooter.howToFindH3', { tags: formattedTagsString, domain: selectedBooru.domain }) }}</h3>
          <p>{{ $t('seoFooter.howToFindP', { tags: formattedTagsLower, domain: selectedBooru.domain }) }}</p>
        </section>
      </article>
    </ShowMore>
  </footer>
</template>
