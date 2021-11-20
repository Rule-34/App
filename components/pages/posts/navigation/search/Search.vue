<template>
  <aside
    class="fixed z-20 w-full h-full bg-black bg-opacity-75"
    @click.self.stop="toggleSearchMenu"
  >
    <!-- Constraint -->
    <div
      class="h-full max-w-3xl px-4 mx-auto sm:px-6 lg:px-8"
      @click.self.stop="toggleSearchMenu"
    >
      <!-- Center content -->
      <div
        class="flex flex-col items-center justify-center h-full"
        @click.self.stop="toggleSearchMenu"
      >
        <!-- Content -->
        <form
          class="flex flex-col w-full h-full space-y-4 max-h-3/4"
          @submit.prevent="emitSubmitActiveTags"
        >
          <!-- Search bar -->
          <div
            class="
              flex flex-row
              h-auto
              p-2
              material-container
              focus-within:focus-util
            "
          >
            <!-- Search Icon -->
            <SearchIcon class="w-6 h-6 icon" />

            <!-- Input form -->
            <!-- Overflow Hidden is very important -->
            <!-- Input because v-model/:value doesn't work on mobile -->
            <input
              :value="search.query"
              aria-label="Search for tags"
              autofocus
              class="
                flex-1
                mx-2
                overflow-hidden
                font-light
                text-gray-200
                outline-none
                bg-darkGray-300
              "
              name="search-tags"
              placeholder="Search: e.g. mario"
              type="search"
              @input="onSearchInput"
              @keypress.enter.prevent="onSearchEnter"
            />

            <div class="flex space-x-1">
              <!-- Tag collections -->
              <button
                aria-label="Toggle Custom Tag Collections"
                title="Custom Tag Collections"
                type="button"
                @click="toggleTagCollections"
              >
                <TagIcon
                  class="
                    w-6
                    h-6
                    transition-colors
                    duration-300
                    icon
                    hover:text-gray-300
                  "
                />
              </button>

              <button
                aria-label="Reset active tags"
                title="Reset active tags"
                type="button"
                @click="resetActiveTags"
              >
                <TrashIcon
                  class="
                    w-6
                    h-6
                    transition-colors
                    duration-300
                    icon
                    hover:text-gray-300
                  "
                />
              </button>

              <!-- Negative -->
              <button
                aria-label="Filter out content"
                title="Filter out content"
                type="button"
                @click="toggleBanMode"
              >
                <FilterIcon
                  :class="{
                    'text-red-500 hover:text-red-400': isBanModeEnabled,
                  }"
                  class="
                    w-6
                    h-6
                    transition-colors
                    duration-300
                    icon
                    hover:text-gray-300
                  "
                />
              </button>
            </div>
          </div>

          <!-- Search results -->
          <div
            class="
              relative
              flex flex-col
              h-full
              p-2
              space-y-2
              material-container
            "
          >
            <!-- If nothing searched -->
            <template v-if="!searchResults.length && !search.activeTags.length">
              <h1
                class="
                  flex
                  items-center
                  justify-center
                  flex-auto
                  text-xl
                  font-light
                  tracking-wide
                  text-gray-200
                "
              >
                Search something!
              </h1>
            </template>

            <template v-else>
              <!-- Active tags, click them to remove them -->
              <template v-if="search.activeTags.length">
                <div
                  class="
                    flex-initial
                    overflow-y-scroll
                    border-0
                    rounded
                    tag-container
                    border-darkGray-100
                  "
                >
                  <button
                    v-for="tag in search.activeTags"
                    :key="tag"
                    class="tag link"
                    type="button"
                    @click="removeFromActiveTags(tag)"
                  >
                    {{ tag }}
                  </button>
                </div>
              </template>

              <!-- Searched tags, click them to add them -->

              <template v-if="searchResults.length">
                <div
                  class="
                    flex-auto
                    overflow-y-scroll
                    border-0
                    rounded
                    border-darkGray-100
                    tag-container
                  "
                >
                  <!-- Add tag to array of added tags -->
                  <button
                    v-for="tag in searchResults"
                    :key="tag.id"
                    class="tag link group"
                    type="button"
                    @click="addToActiveTagConsideringBanMode(tag.name)"
                  >
                    <!-- Name of the tag -->
                    <span>
                      {{ tag.name }}
                    </span>

                    <!-- Number of posts with that tag -->
                    <span
                      class="
                        transition-colors
                        duration-300
                        text-primary-600
                        group-hover:text-primary-500
                      "
                      >{{ `(${tag.count})` }}
                    </span>
                  </button>
                </div>
              </template>
            </template>

            <!-- Submit -->
            <div class="absolute inset-x-0 bottom-0 flex">
              <button
                class="
                  w-full
                  px-4
                  py-2
                  text-lg
                  font-medium
                  tracking-wide
                  text-center text-black
                  bg-gradient-to-r
                  from-accent-400
                  to-primary-400
                  ring-inset
                  focus:focus-util
                "
                type="submit"
              >
                Apply tags
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <transition name="page">
      <SearchTagCollections
        v-if="tagCollections.isActive"
        :search-tags="search.activeTags"
        @mergeToSearchTags="mergeWithActiveTags"
        @toggleTagCollections="toggleTagCollections"
      />
    </transition>
  </aside>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { FilterIcon, SearchIcon, TagIcon, TrashIcon } from 'vue-feather-icons'
import { debounce } from 'lodash-es'

export default {
  components: {
    TagIcon,
    SearchIcon,
    FilterIcon,
    TrashIcon,
  },

  props: {
    initialActiveTags: {
      type: Array,
      default: () => [],
    },
    searchResults: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      search: {
        query: '',

        activeTags: [],
      },

      isBanModeEnabled: false,

      tagCollections: { isActive: false },
    }
  },

  computed: {
    ...mapGetters('premium', ['isUserPremium']),

    // Workaround so we can use cancel on debounce
    // See https://github.com/vuejs/vue/issues/2870
    debouncedEmitOnSearch() {
      return debounce(this.emitOnSearch, 350)
    },
  },

  mounted() {
    // Set active tags from prop on mount
    this.search.activeTags = this.initialActiveTags
  },

  methods: {
    ...mapActions('navigation', ['searchNavigationManager']),

    // #region Navigation
    toggleSearchMenu() {
      this.searchNavigationManager({ operation: 'toggle' })
    },
    // #endregion

    // #region Search bar
    async onSearchInput(event) {
      const inputData = event.target.value

      // Replace empty spaces with underscores
      const replacedInputData = inputData.replace(/\s+/g, '_')

      this.search.query = replacedInputData

      if (this.search.query.length === 0) {
        this.debouncedEmitOnSearch.cancel()
        this.emitResetSearchResults()
        return
      }

      await this.debouncedEmitOnSearch(this.search.query)
    },

    onSearchEnter(tag) {
      this.debouncedEmitOnSearch.cancel()

      this.mergeWithActiveTags([this.search.query])
    },

    emitOnSearch() {
      this.$emit('search', this.search.query)
    },

    emitResetSearchResults() {
      this.$emit('reset-search-results')
    },

    toggleBanMode() {
      this.isBanModeEnabled = !this.isBanModeEnabled
    },

    toggleTagCollections() {
      if (!this.isUserPremium) {
        this.$router.push({ name: 'premium' })
        return
      }

      this.tagCollections.isActive = !this.tagCollections.isActive
    },
    // #endregion

    // #region Search results
    addToActiveTagConsideringBanMode(tag) {
      const prefix = this.isBanModeEnabled ? '-' : ''

      this.mergeWithActiveTags([prefix + tag])
    },

    removeFromActiveTags(tagToRemove) {
      this.search.activeTags = this.search.activeTags.filter(
        (tag) => tag !== tagToRemove
      )
    },

    mergeWithActiveTags(tags) {
      this.search.activeTags = [
        ...new Set([...this.search.activeTags, ...tags]),
      ]
    },

    resetActiveTags() {
      this.search.activeTags = []
    },

    emitSubmitActiveTags() {
      this.$emit('submit-active-tags', this.search.activeTags)

      this.toggleSearchMenu()
    },
    // #endregion
  },
}
</script>
