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
          @submit.prevent="addTagsToBooruState"
        >
          <!-- Search bar -->
          <div class="flex flex-row h-auto p-2 material-container">
            <!-- Search Icon -->
            <SearchIcon class="w-6 h-6 icon" />

            <!-- Input form -->
            <!-- Overflow Hidden is very important -->
            <!-- Input because v-model/:value doesn't work on mobile -->
            <input
              class="flex-1 mx-2 overflow-hidden font-light text-gray-200 outline-none bg-darkGray-300 focus:focus-util"
              type="search"
              name="search-tags"
              autofocus
              aria-label="Search for tags"
              placeholder="Search: e.g. mario"
              @input="inputHandler"
              @keypress.enter.prevent="
                addSearchTagDirectly($event.target.value)
              "
            />

            <div class="flex space-x-1">
              <!-- Tag collections -->
              <button
                type="button"
                aria-label="Toggle Custom Tag Collections"
                title="Custom Tag Collections"
                class="focus:focus-util"
                @click="toggleTagCollections"
              >
                <TagIcon
                  class="w-6 h-6 transition-colors duration-300 icon hover:text-gray-300"
                />
              </button>

              <!-- Reset -->
              <button
                type="button"
                aria-label="Reset tags"
                title="Reset tags"
                class="focus:focus-util"
                @click="resetTags"
              >
                <TrashIcon
                  class="w-6 h-6 transition-colors duration-300 icon hover:text-gray-300"
                />
              </button>

              <!-- Negative -->
              <button
                type="button"
                aria-label="Filter out content"
                title="Filter out content"
                class="focus:focus-util"
                @click="toggleBanMode"
              >
                <FilterIcon
                  :class="{
                    'text-red-500 hover:text-red-400': isBanModeEnabled,
                  }"
                  class="w-6 h-6 transition-colors duration-300 icon hover:text-gray-300"
                />
              </button>
            </div>
          </div>

          <!-- Search results -->
          <div
            class="relative flex flex-col h-full p-2 space-y-2 material-container"
          >
            <!-- If nothing searched -->
            <template v-if="!search.data.length && !search.tags.length">
              <h1
                class="flex items-center justify-center flex-auto text-xl font-light tracking-wide text-gray-200"
              >
                Search something!
              </h1>
            </template>

            <template v-else>
              <!-- Added tags, click them to remove them -->
              <template v-if="search.tags.length">
                <div
                  class="flex-initial overflow-y-scroll border-0 rounded tag-container border-darkGray-100"
                >
                  <button
                    v-for="tag in search.tags"
                    :key="tag"
                    type="button"
                    class="tag link"
                    @click="removeTag(tag)"
                  >
                    {{ tag }}
                  </button>
                </div>
              </template>

              <!-- Searched tags, click them to add them -->

              <template v-if="search.data.length">
                <div
                  class="flex-auto overflow-y-scroll border-0 rounded border-darkGray-100 tag-container"
                >
                  <!-- Add tag to array of added tags -->
                  <button
                    v-for="tag in search.data"
                    :key="tag.name"
                    type="button"
                    class="tag link group"
                    @click="addSearchTagDirectly(tag.name)"
                  >
                    <!-- Name of the tag -->
                    <span>
                      {{ tag.name }}
                    </span>

                    <!-- Number of posts with that tag -->
                    <span
                      class="transition-colors duration-300 text-primary-600 group-hover:text-primary-500"
                      >{{ `(${tag.count})` }}
                    </span>
                  </button>
                </div>
              </template>
            </template>

            <!-- Submit -->
            <div class="absolute inset-x-0 bottom-0 flex">
              <button
                class="w-full px-4 py-2 text-lg font-medium tracking-wide text-center text-black bg-gradient-to-r from-accent-400 to-primary-400 focus:focus-util"
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
        :search-tags="search.tags"
        @toggleTagCollections="toggleTagCollections"
        @mergeToSearchTags="mergeSearchTags"
      />
    </transition>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon, SearchIcon, FilterIcon, TrashIcon } from 'vue-feather-icons'
import { debounce } from 'lodash-es'

export default {
  components: {
    TagIcon,
    SearchIcon,
    FilterIcon,
    TrashIcon,
  },

  data() {
    return {
      search: {
        query: '',

        // Act as a buffer
        tags: [],

        // Searched data
        data: [],
      },

      isBanModeEnabled: false,

      tagCollections: { isActive: false },
    }
  },

  computed: {
    ...mapGetters('premium', ['isUserPremium']),
    ...mapGetters('booru', ['getTags']),
  },

  mounted() {
    this.search.tags = this.getTags
  },

  methods: {
    ...mapActions('navigation', ['searchNavigationManager']),
    ...mapActions('booru', ['tagsManager', 'fetchTags']),

    // #region Navigation
    toggleSearchMenu() {
      this.searchNavigationManager({ operation: 'toggle' })
    },
    // #endregion

    // #region Search bar
    async inputHandler(event) {
      let input = event.target.value

      input = input.replace(/\s+/g, '_')

      event.target.value = input

      await this.fetchSearchDataFromApi(input)
    },

    addSearchTagDirectly(tag) {
      const prefix = this.isBanModeEnabled ? '-' : ''

      this.mergeSearchTags([prefix + tag])
    },

    fetchSearchDataFromApi: debounce(async function (tags) {
      if (tags.length <= 1) {
        await this.tagsManager({
          operation: 'reset',
        })
        return
      }

      const data = await this.fetchTags(tags)

      if (!data) {
        console.debug('No tag data.')
        return
      }

      this.search.data = data
    }, 350),

    resetTags() {
      this.search.tags = []
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
    removeTag(tagToRemove) {
      this.search.tags = this.search.tags.filter((tag) => tag !== tagToRemove)
    },

    mergeSearchTags(tags) {
      this.search.tags = [...new Set([...this.search.tags, ...tags])]
    },

    async addTagsToBooruState() {
      await this.tagsManager({
        operation: 'set',
        value: this.search.tags,
      })
    },
    // #endregion
  },
}
</script>
