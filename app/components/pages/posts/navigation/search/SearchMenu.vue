<script lang="ts" setup>
  import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon, NoSymbolIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { TagIcon } from '@heroicons/vue/24/outline'
  import { watchDebounced } from '@vueuse/core'
  import { abbreviateNumber } from 'js-abbreviation-number'
  import { cloneDeep, unionWith } from 'es-toolkit'
  import type { Component } from 'vue'
  import Tag from '~/assets/js/tag.dto'
  import SearchSelect from './SearchSelect.vue'

  type FilterValue = string | number | boolean | null | undefined
  type FilterOption = { label: string; value: FilterValue }
  type FilterConfig = {
    type: 'select'
    label: string
    options: FilterOption[]
    icon: Component
  }
  type HeadlessElementRef = HTMLElement | { el?: Element | null; $el?: Element | null }

  const props = defineProps<{
    initialSelectedTags: Tag[]
    initialSelectedFilters: Record<string, FilterValue>
    filterConfig: Record<string, FilterConfig>
    tagResults: Tag[]
  }>()

  const emit = defineEmits<{
    searchTag: [tag: string]

    submit: [
      payload: {
        tags: Tag[]
        filters: Record<string, FilterValue>
      }
    ]
  }>()

  const { t } = useI18n()

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
    const comboboxOptionsAreOpen =
      getHeadlessElement(comboboxOptionsRef.value)?.getAttribute('data-headlessui-state') === 'open'

    if (comboboxOptionsAreOpen) {
      getHeadlessElement(comboboxButtonRef.value)?.click()
    }
  })

  const searchQuery = shallowRef('')

  const comboboxButtonRef = shallowRef<HeadlessElementRef | null>(null)
  const comboboxOptionsRef = shallowRef<HeadlessElementRef | null>(null)

  function getHeadlessElement(value: HeadlessElementRef | null): HTMLElement | null {
    if (value instanceof HTMLElement) {
      return value
    }

    const element = value?.el ?? value?.$el

    return element instanceof HTMLElement ? element : null
  }

  // Change event
  function onComboboxInputChange(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return
    }

    let value = event.target.value

    value = value.trim()

    // Replace empty spaces with underscores
    value = value.replace(/\s/g, '_')

    searchQuery.value = value
  }

  watchDebounced(searchQuery, (value) => onSearchChange(value), { debounce: 350 })

  const customTagFromQuery = computed(() => {
    const tag = searchQuery.value

    if (!tag || tag === '') {
      return null
    }

    // If the tag is already in tagResults, return null
    if (props.tagResults.some((tagResult) => tagResult.name === tag)) {
      return null
    }

    return new Tag({ name: tag })
  })

  function removeTagFromSelectedTags(index: number) {
    selectedTags.value.splice(index, 1)
  }

  function isTagExcluded(tag: string) {
    return tag.startsWith('-')
  }

  function toggleSelectedTagAsExcluded(index: number) {
    const tag = selectedTags.value[index]

    if (!tag) {
      return
    }

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
        Object.entries(selectedFilters.value).map(([key, filter]) => [key, filter?.value])
      )
    })
  }

  const selectedFilters = ref<Record<string, FilterOption>>(
    Object.fromEntries(
      Object.entries(props.filterConfig).map(([filterKey, filter]) => {
        const initialFilterValue = props.initialSelectedFilters[filterKey]
        const selectedOption = filter.options.find((option) => option.value === initialFilterValue) ??
          filter.options[0] ?? {
            label: filter.label,
            value: undefined
          }

        return [filterKey, selectedOption]
      })
    )
  )

  function getDefaultFilterOption(filter: FilterConfig): FilterOption {
    return (
      filter.options[0] ?? {
        label: filter.label,
        value: undefined
      }
    )
  }

  function getSelectedFilter(filterKey: string, filter: FilterConfig): FilterOption {
    return selectedFilters.value[filterKey] ?? getDefaultFilterOption(filter)
  }

  function setSelectedFilter(filterKey: string, value: FilterOption) {
    selectedFilters.value[filterKey] = value
  }

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
        {{ t('search.label') }}
      </HeadlessComboboxLabel>

      <div class="group relative mt-4">
        <!-- Icon -->
        <div class="group pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md px-2">
          <MagnifyingGlassIcon
            aria-hidden="true"
            class="h-5 w-5 text-base-content group-hover:text-base-content-hover"
          />
        </div>

        <!-- Input -->
        <HeadlessComboboxInput
          class="w-full rounded-full border-0 bg-base-1000 px-9 py-2 text-base-content-highlight ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm"
          :placeholder="t('search.placeholder')"
          @change="onComboboxInputChange"
        />

        <!-- Button -->
        <HeadlessComboboxButton
          ref="comboboxButtonRef"
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2"
        >
          <ChevronUpDownIcon
            aria-hidden="true"
            class="h-5 w-5 text-base-content group-hover:text-base-content-hover"
          />
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
              :class="[active ? 'hover-bg-util text-base-content-highlight' : 'text-base-content']"
              class="relative cursor-default py-2 pl-8 select-none"
            >
              <span :class="['block truncate', selected && 'font-semibold']">
                {{ t('search.createTag', { tag: customTagFromQuery.name }) }}
              </span>

              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-1.5 text-base-content-highlight"
              >
                <CheckIcon
                  aria-hidden="true"
                  class="h-5 w-5"
                />
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
              :class="[active ? 'hover-bg-util text-base-content-highlight' : 'text-base-content']"
              class="relative cursor-default py-2 pr-12 pl-8 select-none"
            >
              <!-- Check icon -->
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-1.5 text-base-content-highlight"
              >
                <CheckIcon
                  aria-hidden="true"
                  class="h-5 w-5"
                />
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
    <section class="-mx-5 mt-8 scrollbar-hide flex gap-4 overflow-x-auto py-1 pr-3 before:w-1 after:w-1">
      <!-- -->

      <!-- Tag Collections Toggler -->
      <div>
        <button
          class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          type="button"
          @click="isTagCollectionsActive = !isTagCollectionsActive"
        >
          <TagIcon
            aria-hidden="true"
            class="-ml-0.5 h-[1.15rem] w-[1.15rem]"
          />

          <span class="text-sm font-medium whitespace-nowrap">{{ t('common.collections') }}</span>
        </button>

        <BottomSheetWrapper v-model="isTagCollectionsActive">
          <div class="px-4 py-4">
            <TagCollections
              :selected-tags="selectedTags"
              @update-selected-tags="onTagCollectionsSetSelectedTags"
            />
          </div>
        </BottomSheetWrapper>
      </div>

      <!-- Dynamic Filters -->
      <template
        v-for="(filter, key) in props.filterConfig"
        :key="key"
      >
        <component
          :is="getFilterComponent(filter.type)"
          :icon="filter.icon"
          :label="filter.label"
          :model-value="getSelectedFilter(key, filter)"
          :options="filter.options"
          @update:model-value="setSelectedFilter(key, $event)"
        />
      </template>
    </section>
  </section>

  <!-- Tags -->
  <section class="flex-1 overflow-y-auto">
    <div v-if="selectedTags.length">
      <p class="block text-lg font-medium text-base-content">{{ t('search.selectedTags') }}</p>

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
            class="group inline-flex items-center rounded-l-full border border-r-0 border-base-0/20 py-1 pr-1.5 pl-2.5 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util focus-visible:ring-inset"
            type="button"
            @click="removeTagFromSelectedTags(index)"
          >
            <span class="text-sm font-medium group-hover:hover-text-util">
              {{ isTagExcluded(tag.name) ? tag.name.substring(1) : tag.name }}
            </span>
          </button>

          <!-- Exclude button -->
          <button
            :aria-label="isTagExcluded(tag.name) ? t('search.includeTag') : t('search.excludeTag')"
            class="group inline-flex h-full items-center rounded-r-full border border-base-0/20 py-1 pr-2.5 pl-1.5 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util focus-visible:ring-inset"
            type="button"
            @click="toggleSelectedTagAsExcluded(index)"
          >
            <NoSymbolIcon
              v-if="!isTagExcluded(tag.name)"
              aria-hidden="true"
              class="h-4 w-4"
            />

            <PlusIcon
              v-else
              aria-hidden="true"
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
      {{ t('search.tagNote') }}
      <br />
      {{ t('search.removeTagHint') }}
      <br />
      {{ t('search.excludeTagHint') }}
    </p>

    <button
      class="mx-auto inline-flex w-full items-center justify-center rounded-md px-3 py-1 text-base ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      type="submit"
      @click="onSubmitted"
    >
      {{ t('search.submit') }}
    </button>
  </footer>
</template>
