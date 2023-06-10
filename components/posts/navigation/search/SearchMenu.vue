<script lang="ts" setup>
  import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxLabel,
    ComboboxOption,
    ComboboxOptions
  } from '@headlessui/vue'
  import { Bars3BottomRightIcon, EyeIcon, StarIcon, TagIcon } from '@heroicons/vue/24/outline'
  import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon, NoSymbolIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { watchDebounced } from '@vueuse/core'
  import { abbreviateNumber } from 'js-abbreviation-number'
  import Tag from 'assets/js/tag.dto'
  import { uniqBy } from 'lodash-es'

  const { isActive: isTagCollectionsActive, toggleIsActive: toggleTagCollections } = useTagCollections()

  const props = defineProps<{
    initialSelectedTags: Tag[]

    initialSelectedFilters: {
      sort: string
      rating: string
      score: string
    }

    tagResults: Tag[]
  }>()

  const emit = defineEmits<{
    searchTag: [tag: string]

    submit: [
      payload: {
        tags: Tag[]
        filters: {
          sort: string
          rating: string
          score: string
        }
      }
    ]
  }>()

  const selectedTags = ref(props.initialSelectedTags)

  const searchQuery = ref('')

  watchDebounced(searchQuery, (value) => onSearchChange(value), { debounce: 350 })

  const customTagFromQuery = computed(() => {
    let tag = searchQuery.value.trim()

    if (!tag || tag === '') {
      return null
    }

    // Replace empty spaces with underscores
    tag = tag.replace(/\s+/g, '_')

    // If the tag is already in tagResults, return null
    if (props.tagResults.some((tagResult) => tagResult.name === tag)) {
      return null
    }

    return {
      name: tag,
      count: null
    }
  })

  function removeTagFromSelectedTags(index: number) {
    selectedTags.value.splice(index, 1)
  }

  function isTagExcluded(tag: string) {
    return tag.startsWith('-')
  }

  function toggleSelectedTagAsExcluded(index: number) {
    const tag = selectedTags.value[index]

    // Change the tag name to include a minus sign if it's not already there
    switch (isTagExcluded(tag.name)) {
      case true:
        tag.name = tag.name.substring(1)
        break

      case false:
        tag.name = `-${tag.name}`
        break
    }
  }

  function onSearchChange(tag: string) {
    tag = tag.trim()

    if (!tag || tag === '') {
      return
    }

    emit('searchTag', tag)
  }

  function onTagCollectionsSetSelectedTags(tags: Tag[]) {
    toggleTagCollections(false)

    const mergedTags = [...selectedTags.value, ...tags]

    const uniqueMergedTags = uniqBy(mergedTags, 'name')

    selectedTags.value = uniqueMergedTags
  }

  function onSubmitted() {
    emit('submit', {
      tags: selectedTags.value,
      filters: {
        sort: selectedSortingOption.value.value,
        rating: selectedRatingOption.value.value,
        score: selectedScoreOption.value.value
      }
    })
  }

  // Sorting
  const sortingOptions = [
    { title: 'Sort', value: undefined },
    { title: 'Score', value: 'score' },
    { title: 'Created', value: 'id' }
  ]

  const selectedSortingOption = ref(sortingOptions.find((option) => option.value === props.initialSelectedFilters.sort))

  // Rating
  const ratingOptions = [
    { title: 'Rating', value: undefined },
    { title: 'Safe', value: 'safe' },
    { title: 'General', value: 'general' },
    { title: 'Sensitive', value: 'sensitive' },
    { title: 'Questionable', value: 'questionable' },
    { title: 'Explicit', value: 'explicit' }
  ]

  const selectedRatingOption = ref(ratingOptions.find((option) => option.value === props.initialSelectedFilters.rating))

  // Score
  const scoreOptions = [
    { title: 'Score', value: undefined },
    { title: '>= 0', value: '>=0' },
    { title: '>= 10', value: '>=10' },
    { title: '>= 25', value: '>=25' },
    { title: '>= 50', value: '>=50' },

    { title: '>= 100', value: '>=100' },
    { title: '>= 250', value: '>=250' },
    { title: '>= 500', value: '>=500' },
    { title: '>= 750', value: '>=750' },

    { title: '>= 1000', value: '>=1000' }
  ]

  const selectedScoreOption = ref(scoreOptions.find((option) => option.value === props.initialSelectedFilters.score))
</script>

<template>
  <TagCollectionsWrapper
    :modelValue="isTagCollectionsActive"
    @update:modelValue="toggleTagCollections"
  >
    <LazyTagCollections
      :selectedTags="selectedTags"
      @updateSelectedTags="onTagCollectionsSetSelectedTags"
    />
  </TagCollectionsWrapper>

  <!--  Search & Actions -->
  <section>
    <!-- Search -->
    <Combobox
      v-model="selectedTags"
      by="name"
      multiple
    >
      <ComboboxLabel class="block text-center text-3xl font-semibold tracking-wide text-base-content-highlight">
        Search
      </ComboboxLabel>

      <div class="group relative mt-4">
        <!-- Icon -->
        <div class="group pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md px-2">
          <MagnifyingGlassIcon class="h-5 w-5 text-base-content group-hover:text-base-content-hover" />
        </div>

        <!-- Input -->
        <ComboboxInput
          :displayValue="(tag) => tag.name"
          class="focus-visible:focus-util hover:hover-bg-util hover:hover-text-util w-full rounded-full border-0 bg-base-1000 px-9 py-2 text-base-content-highlight ring-1 ring-inset ring-base-0/20 sm:text-sm"
          @change="searchQuery = $event.target.value"
        />

        <!-- Button -->
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2">
          <ChevronUpDownIcon class="h-5 w-5 text-base-content group-hover:text-base-content-hover" />
        </ComboboxButton>

        <!-- Options -->
        <ComboboxOptions
          class="absolute mt-2 max-h-72 w-full overflow-auto rounded-md bg-base-1000 py-1 text-base ring-1 ring-base-0/20 sm:text-sm"
        >
          <ComboboxOption
            v-for="tag in tagResults"
            :key="tag.name"
            v-slot="{ active, selected }"
            :value="tag"
          >
            <div
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="relative cursor-default select-none py-2 pl-8 pr-12"
            >
              <!-- Check icon -->
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-1.5 text-base-content-highlight"
              >
                <CheckIcon class="h-5 w-5" />
              </span>

              <!-- Tag -->
              <span :class="['block truncate', selected && 'font-semibold']">
                {{ tag.name }}
              </span>

              <!-- Tag count -->
              <div class="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
                <span v-if="tag.count">
                  {{ abbreviateNumber(tag.count, 0) }}
                </span>
              </div>
            </div>
          </ComboboxOption>

          <!-- TODO: History based -->

          <!-- Custom -->
          <ComboboxOption
            v-if="customTagFromQuery"
            v-slot="{ active, selected }"
            :value="customTagFromQuery"
          >
            <div
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="relative cursor-default select-none py-2 pl-8"
            >
              <span :class="['block truncate', selected && 'font-semibold']">
                Create “{{ customTagFromQuery.name }}” tag
              </span>

              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-1.5 text-base-content-highlight"
              >
                <CheckIcon class="h-5 w-5" />
              </span>
            </div>
          </ComboboxOption>
        </ComboboxOptions>
      </div>
    </Combobox>

    <!-- Filters -->
    <section class="scrollbar-hide -mx-5 mt-8 flex gap-4 overflow-x-auto py-1 pr-3 before:w-1 after:w-1">
      <!-- -->

      <!-- Tag Collections Toggler -->
      <div>
        <button
          class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ring-1 ring-base-0/20"
          type="button"
          @click="toggleTagCollections(true)"
        >
          <TagIcon class="-ml-0.5 h-[1.15rem] w-[1.15rem]" />

          <span class="whitespace-nowrap text-sm font-medium">Collections</span>
        </button>
      </div>

      <!-- Sort Filter -->
      <SearchSelect
        v-model="selectedSortingOption"
        :icon="Bars3BottomRightIcon"
        :options="sortingOptions"
      />

      <!-- Rating filter -->
      <SearchSelect
        v-model="selectedRatingOption"
        :icon="EyeIcon"
        :options="ratingOptions"
      />

      <!-- Score filter -->
      <SearchSelect
        v-model="selectedScoreOption"
        :icon="StarIcon"
        :options="scoreOptions"
      />

      <!-- TODO: Clear all button -->
    </section>
  </section>

  <!-- Tags -->
  <section class="flex-1 overflow-y-auto">
    <div v-if="selectedTags.length">
      <p class="block text-lg font-medium text-base-content">Selected tags</p>

      <!-- Selected tags -->
      <ol class="mt-2 flex flex-wrap gap-2.5 rounded-md">
        <!-- -->

        <li
          v-for="(tag, index) in selectedTags"
          :key="tag.name"
          class="group flex items-center overflow-hidden rounded-md align-middle"
        >
          <!-- Main -->
          <button
            :class="{
              'line-through': isTagExcluded(tag.name)
            }"
            class="focus-visible:focus-util hover:hover-bg-util hover:hover-text-util group inline-flex items-center rounded-l-full border border-r-0 border-base-0/20 py-1 pl-2.5 pr-1.5 focus-visible:ring-inset"
            type="button"
            @click="removeTagFromSelectedTags(index)"
          >
            <span class="group-hover:hover-text-util text-sm font-medium">
              {{ isTagExcluded(tag.name) ? tag.name.substring(1) : tag.name }}
            </span>
          </button>

          <!-- Exclude button -->
          <button
            class="focus-visible:focus-util hover:hover-bg-util hover:hover-text-util group inline-flex h-full items-center rounded-r-full border border-base-0/20 py-1 pl-1.5 pr-2.5 focus-visible:ring-inset"
            type="button"
            @click="toggleSelectedTagAsExcluded(index)"
          >
            <PlusIcon
              v-if="!isTagExcluded(tag.name)"
              class="h-4 w-4"
            />

            <NoSymbolIcon
              v-else
              class="h-4 w-4"
            />
          </button>
        </li>
      </ol>
    </div>
  </section>

  <!-- Footer -->
  <footer class="flex flex-col gap-6">
    <p
      v-if="selectedTags.length"
      class="mt-4 text-xs text-gray-400"
    >
      Tip: click on a tag name to remove it, or exclude it from results by clicking the plus icon
    </p>

    <button
      class="focus-visible:focus-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex w-full items-center justify-center rounded-md px-3 py-1 text-base ring-1 ring-base-0/20"
      type="submit"
      @click="onSubmitted"
    >
      Search
    </button>
  </footer>
</template>
