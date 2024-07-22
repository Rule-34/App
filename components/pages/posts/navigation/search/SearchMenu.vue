<script lang="ts" setup>
  import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon, NoSymbolIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { TagIcon } from '@heroicons/vue/24/outline'
  import { watchDebounced } from '@vueuse/core'
  import { abbreviateNumber } from 'js-abbreviation-number'
  import { cloneDeep, unionWith } from 'lodash-es'
  import Tag from '~/assets/js/tag.dto'
  import SearchSelect from './SearchSelect.vue'

  const props = defineProps<{
    initialSelectedTags: Tag[]
    initialSelectedFilters: Record<string, any>
    filterConfig: {
      [key: string]: {
        type: 'select'
        label: string
        options?: { label: string; value: any }[]
        icon?: any
      }
    }
    tagResults: Tag[]
  }>()

  const emit = defineEmits<{
    searchTag: [tag: string]

    submit: [
      payload: {
        tags: Tag[]
        filters: Record<string, any>
      }
    ]
  }>()

  const isTagCollectionsActive = ref(false)

  /**
   * Info: ShallowRef will only update when the entire value changes
   * So modifying the value, will not work, as seen on:
   * @see removeTagFromSelectedTags
   * @see toggleSelectedTagAsExcluded
   */
  const selectedTags = ref(cloneDeep(props.initialSelectedTags))

  /**
   * Close combobox options when a tag is selected
   */
  watch(selectedTags, async () => {
    const comboboxOptionsAreOpen = comboboxOptionsRef.value?.el?.getAttribute('data-headlessui-state') === 'open'

    if (comboboxOptionsAreOpen) {
      comboboxButtonRef.value?.el.click()
    }
  })

  const searchQuery = shallowRef('')

  const comboboxButtonRef = ref<HTMLInputElement | null>(null)
  const comboboxOptionsRef = ref<HTMLInputElement | null>(null)

  // Change event
  function onComboboxInputChange(event: InputEvent) {
    let value = (event.target as HTMLInputElement).value

    value = value.trim()

    // Replace empty spaces with underscores
    value = value.replace(/\s/g, '_')

    searchQuery.value = value
  }

  watchDebounced(searchQuery, (value) => onSearchChange(value), { debounce: 350 })

  const customTagFromQuery = computed(() => {
    let tag = searchQuery.value

    if (!tag || tag === '') {
      return null
    }

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
    isTagCollectionsActive.value = false

    const uniqueMergedTags = unionWith(selectedTags.value, tags, (tagA, tagB) => tagA.name === tagB.name)

    selectedTags.value = uniqueMergedTags
  }

  function onSubmitted() {
    emit('submit', {
      tags: selectedTags.value,
      filters: Object.fromEntries(
        //
        Object.entries(selectedFilters.value).map(([key, filter]) => [key, filter.value])
      )
    })
  }

  const selectedFilters = ref(
    Object.fromEntries(
      Object.entries(props.initialSelectedFilters).map(([initialFilterKey, initialFilterValue], index) => [
        initialFilterKey,
        props.filterConfig[initialFilterKey].options?.find((option) => option.value === initialFilterValue)
      ])
    )
  )

  function getFilterComponent(type: string) {
    switch (type) {
      case 'select':
        return SearchSelect
      default:
        throw new Error(`Unknown filter type: ${type}`)
    }
  }
</script>

<template>
  <!--  Search & Actions -->
  <section>
    <!-- Search -->
    <HeadlessCombobox
      v-model="selectedTags"
      by="name"
      multiple
    >
      <HeadlessComboboxLabel class="block text-center text-3xl font-semibold tracking-wide text-base-content-highlight">
        Search
      </HeadlessComboboxLabel>

      <div class="group relative mt-4">
        <!-- Icon -->
        <div class="group pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md px-2">
          <MagnifyingGlassIcon class="h-5 w-5 text-base-content group-hover:text-base-content-hover" />
        </div>

        <!-- Input -->
        <HeadlessComboboxInput
          class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util w-full rounded-full border-0 bg-base-1000 px-9 py-2 text-base-content-highlight ring-1 ring-inset ring-base-0/20 sm:text-sm"
          placeholder="Search for tags"
          @change="onComboboxInputChange"
        />

        <!-- Button -->
        <HeadlessComboboxButton
          ref="comboboxButtonRef"
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2"
        >
          <ChevronUpDownIcon class="h-5 w-5 text-base-content group-hover:text-base-content-hover" />
        </HeadlessComboboxButton>

        <!-- Options -->
        <HeadlessComboboxOptions
          ref="comboboxOptionsRef"
          class="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-md bg-base-1000 py-1 text-base ring-1 ring-base-0/20 sm:text-sm"
        >
          <!-- Custom option -->
          <!-- TODO: History based -->
          <HeadlessComboboxOption
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
          </HeadlessComboboxOption>

          <!-- Options -->
          <HeadlessComboboxOption
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
          </HeadlessComboboxOption>
        </HeadlessComboboxOptions>
      </div>
    </HeadlessCombobox>

    <!-- Filters -->
    <section class="scrollbar-hide -mx-5 mt-8 flex gap-4 overflow-x-auto py-1 pr-3 before:w-1 after:w-1">
      <!-- -->

      <!-- Tag Collections Toggler -->
      <div>
        <button
          class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ring-1 ring-base-0/20"
          type="button"
          @click="isTagCollectionsActive = !isTagCollectionsActive"
        >
          <TagIcon class="-ml-0.5 h-[1.15rem] w-[1.15rem]" />

          <span class="whitespace-nowrap text-sm font-medium">Collections</span>
        </button>

        <BottomSheetWrapper v-model="isTagCollectionsActive">
          <div class="px-4 py-4">
            <TagCollections
              :selectedTags="selectedTags"
              @updateSelectedTags="onTagCollectionsSetSelectedTags"
            />
          </div>
        </BottomSheetWrapper>
      </div>

      <!-- Dynamic Filters -->
      <template
        v-for="(filter, key, index) in props.filterConfig"
        :key="key"
      >
        <component
          :is="getFilterComponent(filter.type)"
          v-model="selectedFilters[key]"
          :label="filter.label"
          :options="filter.options"
          :icon="filter.icon"
        />
      </template>
    </section>
  </section>

  <!-- Tags -->
  <section class="flex-1 overflow-y-auto">
    <div v-if="selectedTags.length">
      <p class="block text-lg font-medium text-base-content">Selected tags</p>

      <!-- Selected tags -->
      <ol class="mt-2 flex flex-wrap gap-2.5 rounded-md">
        <!-- -->

        <!-- TODO: Clear all button -->

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
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util group inline-flex items-center rounded-l-full border border-r-0 border-base-0/20 py-1 pl-2.5 pr-1.5 focus-visible:ring-inset"
            type="button"
            @click="removeTagFromSelectedTags(index)"
          >
            <span class="group-hover:hover-text-util text-sm font-medium">
              {{ isTagExcluded(tag.name) ? tag.name.substring(1) : tag.name }}
            </span>
          </button>

          <!-- Exclude button -->
          <button
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util group inline-flex h-full items-center rounded-r-full border border-base-0/20 py-1 pl-1.5 pr-2.5 focus-visible:ring-inset"
            type="button"
            @click="toggleSelectedTagAsExcluded(index)"
          >
            <NoSymbolIcon
              v-if="!isTagExcluded(tag.name)"
              class="h-4 w-4"
            />

            <PlusIcon
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
      class="mt-4 text-xs"
    >
      Note:
      <br />
      To remove a tag, click on its name
      <br />
      To exclude search results with a specific tag, click the block icon next to it
    </p>

    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex w-full items-center justify-center rounded-md px-3 py-1 text-base ring-1 ring-base-0/20"
      type="submit"
      @click="onSubmitted"
    >
      Search
    </button>
  </footer>
</template>
