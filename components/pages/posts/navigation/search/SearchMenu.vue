<script lang="ts" setup>
  import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxLabel,
    ComboboxOption,
    ComboboxOptions,
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot
  } from '@headlessui/vue'
  import { XMarkIcon } from '@heroicons/vue/24/outline'
  import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon, NoSymbolIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { watchDebounced } from '@vueuse/core'
  import { abbreviateNumber } from 'js-abbreviation-number'

  const { value: isSearchMenuActive, toggle: toggleSearchMenu } = useSearchMenu()

  const props = defineProps({
    initialSelectedTags: {
      type: Array,
      required: true
    },
    tagResults: {
      type: Array,
      required: true
    }
  })

  const emit = defineEmits(['search-tag', 'submit'])

  const selectedTags = ref(props.initialSelectedTags)

  const searchQuery = ref('')

  watchDebounced(searchQuery, (value) => onSearchChange(value), { debounce: 350 })

  const customTagFromQuery = computed(() => {
    const tag = searchQuery.value.trim()

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

    emit('search-tag', tag)
  }

  function onSubmitted() {
    emit('submit', { tags: selectedTags.value, filters: {} })
  }
</script>

<template>
  <TransitionRoot
    :show="isSearchMenuActive"
    as="template"
  >
    <Dialog
      as="div"
      class="relative z-30"
      @close="toggleSearchMenu(false)"
    >
      <!-- Background -->
      <TransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-1000/80 backdrop-blur" />
      </TransitionChild>

      <div class="fixed inset-0 flex flex-row-reverse">
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <DialogPanel class="relative ml-16 flex w-full max-w-xs flex-1">
            <!-- Close button -->
            <TransitionChild
              as="template"
              enter="ease-in-out duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="ease-in-out duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div class="absolute right-full top-0 flex w-16 justify-center pt-5">
                <button
                  class="focus-visible:focus-util hover:hover-bg-util -m-2.5 rounded-md p-2.5"
                  type="button"
                  @click="toggleSearchMenu(false)"
                >
                  <span class="sr-only">Close menu</span>

                  <XMarkIcon
                    aria-hidden="true"
                    class="hover:hover-text-util h-6 w-6 text-base-content-highlight"
                  />
                </button>
              </div>
            </TransitionChild>

            <!-- Sidebar -->
            <div class="flex grow flex-col gap-y-6 overflow-y-auto bg-base-1000 px-6 pb-6 pt-12 ring-1 ring-base-0/10">
              <!-- -->

              <!-- Search -->
              <section>
                <Combobox
                  v-model="selectedTags"
                  by="name"
                  multiple
                >
                  <ComboboxLabel
                    class="block text-center text-3xl font-semibold tracking-wide text-base-content-highlight"
                  >
                    Search
                  </ComboboxLabel>

                  <div class="group relative mt-4">
                    <!-- Icon -->
                    <div
                      class="group pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md px-2"
                    >
                      <MagnifyingGlassIcon
                        aria-hidden="true"
                        class="h-5 w-5 text-base-content group-hover:text-base-content-hover"
                      />
                    </div>

                    <!-- Input -->
                    <ComboboxInput
                      :displayValue="(tag) => tag.name"
                      class="focus-visible:focus-util hover:hover-bg-util hover:hover-text-util w-full rounded-full border-0 bg-base-1000 px-9 py-2 text-base-content-highlight shadow-sm ring-1 ring-inset ring-base-0/20 sm:text-sm sm:leading-6"
                      @change="searchQuery = $event.target.value"
                    />

                    <!-- Button -->
                    <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2">
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        class="h-5 w-5 text-base-content group-hover:text-base-content-hover"
                      />
                    </ComboboxButton>

                    <!-- Options -->
                    <ComboboxOptions
                      class="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-md bg-base-1000 py-1 text-base shadow-lg ring-1 ring-base-0/20 sm:text-sm"
                    >
                      <ComboboxOption
                        v-for="tag in tagResults"
                        :key="tag.name"
                        v-slot="{ active, selected }"
                        :value="tag"
                      >
                        <div
                          :class="[
                            'relative cursor-default select-none py-2 pl-8 pr-12',
                            active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content'
                          ]"
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
                            <span
                              v-if="tag.count"
                              class="text-base-content-highlight"
                            >
                              {{ abbreviateNumber(tag.count, 0) }}
                            </span>
                          </div>
                        </div>
                      </ComboboxOption>

                      <!-- Custom -->
                      <ComboboxOption
                        v-if="customTagFromQuery"
                        v-slot="{ active, selected }"
                        :value="customTagFromQuery"
                      >
                        <div
                          :class="[
                            'relative cursor-default select-none py-2 pl-8 pr-12',
                            active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content'
                          ]"
                        >
                          <span :class="['block truncate', selected && 'font-semibold']">
                            Add "{{ customTagFromQuery.name }}" as a custom tag
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
                      </ComboboxOption>
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </section>

              <!-- Filters -->
              <section>
                <!-- TODO: Tag Collections -->
                <!-- TODO: Sort filter -->
                <!-- TODO: Score filter -->
                <!-- TODO: Rating filter -->
              </section>

              <!-- Tags -->
              <section class="flex-1 overflow-y-auto">
                <div v-if="selectedTags.length">
                  <!--                  <p class="block text-lg font-medium text-gray-300">Selected</p>-->

                  <!-- Selected tags -->
                  <ol class="flex flex-wrap gap-2 rounded-md">
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
                          aria-hidden="true"
                          class="h-4 w-4"
                        />

                        <NoSymbolIcon
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
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
