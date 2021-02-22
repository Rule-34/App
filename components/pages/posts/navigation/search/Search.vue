<template>
  <form class="p-4 md:p-0 md:gap-4 search-grid">
    <!-- Space for clicking out -->
    <div @click.self.stop="closeSearchMenu" />

    <!-- Search bar -->
    <div class="flex p-2 my-auto material-container bg-background">
      <SearchIcon class="w-6 h-6 icon text-default" />

      <!-- Input form -->
      <!-- Overflow Hidden is very important -->
      <!-- Input because v-model/:value doesn't work on mobile -->
      <input
        class="flex-1 mx-2 overflow-hidden font-light outline-none text-default-text bg-background"
        type="search"
        name="tags"
        placeholder="Search: e.g. dragon"
        @input="inputHandler"
        @keypress.enter.prevent="addTagDirectly"
      />

      <div class="flex space-x-1">
        <!-- Tag collections -->
        <button
          type="button"
          aria-label="Toggle Custom Tag Collections"
          title="Custom Tag Collections"
          @click="toggleTagCollections"
        >
          <TagIcon
            class="w-6 h-6 transition-colors duration-300 icon hover:text-default-text-muted"
          />
        </button>

        <!-- Reset -->
        <button
          type="button"
          aria-label="Reset tags"
          title="Reset tags"
          @click="resetTags"
        >
          <TrashIcon
            class="w-6 h-6 transition-colors duration-300 icon hover:text-default-text-muted"
          />
        </button>

        <!-- Negative -->
        <button
          type="button"
          aria-label="Filter out content"
          title="Filter out content"
          @click="toggleBanMode"
        >
          <FilterIcon
            :class="{ 'text-red-400': isBanModeEnabled }"
            class="w-6 h-6 transition-colors duration-300 icon"
          />
        </button>
      </div>

      <transition name="page">
        <SearchTagCollections
          v-if="tagCollections.isActive"
          class="absolute inset-0 z-30 bg-black bg-opacity-25"
          @toggleTagCollections="toggleTagCollections"
        />
      </transition>
    </div>

    <!-- Search results -->
    <div
      class="flex flex-col max-h-full min-h-full my-auto material-container md:min-h-2/5 md:max-h-2/5"
    >
      <div
        class="flex flex-col flex-1 max-h-full min-h-full p-2 pb-0 overflow-y-hidden"
      >
        <!-- If nothing searched -->
        <h1
          v-if="!search.data && !getTags.length"
          class="flex items-center justify-center flex-1 text-xl font-light tracking-wide text-default-text"
        >
          Search something!
        </h1>

        <!-- Added tags, click them to remove them -->
        <div
          v-show="getTags.length"
          class="mb-1 overflow-y-scroll border-b rounded tag-container border-border max-h-1/2"
        >
          <button
            v-for="tag in getTags"
            :key="tag"
            type="button"
            class="tag color-util"
            @click="removeTag(tag)"
          >
            {{ tag }}
          </button>
        </div>

        <!-- Searched tags, click them to add them -->
        <div
          v-show="search.data"
          class="flex-1 overflow-y-scroll rounded rounded-b-none tag-container"
        >
          <!-- Add tag to array of added tags -->
          <button
            v-for="tag in search.data"
            :key="tag.name"
            type="button"
            class="tag color-util group"
            @click="addTag(tag.name)"
          >
            <!-- Name of the tag -->
            <span>
              {{ tag.name }}
            </span>

            <!-- Number of posts with that tag -->
            <span
              class="transition-colors duration-300 text-primary-hover group-hover:text-default"
              >{{ `(${tag.count})` }}
            </span>
          </button>
        </div>
      </div>

      <!-- Apply tags button -->
      <!-- <button
        class="w-full px-4 py-2 text-lg font-bold tracking-wide text-center shadow-md text-default-text bg-gradient-lilac-blue"
        type="submit"
        @click.prevent="fetchAddedTags"
      >
        Apply tags
      </button> -->
    </div>

    <!-- Space for clicking out -->
    <div @click.self.stop="closeSearchMenu" />
  </form>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon, SearchIcon, FilterIcon, TrashIcon } from 'vue-feather-icons'
import { debounce } from 'lodash-es'

import SearchTagCollections from './SearchTagCollections.vue'

export default {
  components: {
    TagIcon,
    SearchIcon,
    FilterIcon,
    TrashIcon,
    SearchTagCollections,
  },

  data() {
    return {
      search: { query: '', data: undefined },

      isBanModeEnabled: false,

      tagCollections: { isActive: false },
    }
  },

  computed: {
    ...mapGetters('premium', ['isUserPremium']),
    ...mapGetters('booru', ['getTags']),
  },

  methods: {
    ...mapActions('navigation', ['searchNavigationManager']),
    ...mapActions('booru', ['tagsManager', 'fetchPosts', 'fetchTags']),

    // #region Navigation
    async closeSearchMenu() {
      await this.searchNavigationManager({ operation: 'set', value: false })
    },
    // #endregion

    // #region Search bar
    async inputHandler(event) {
      let input = event.target.value

      input = input.replace(/\s+/g, '_')

      event.target.value = input

      await this.fetchTagsFromApi(input)
    },

    async addTagDirectly(event) {
      await this.tagsManager({
        operation: 'merge',
        value: [event.target.value],
      })
    },

    fetchTagsFromApi: debounce(async function (tag) {
      if (tag.length <= 1) {
        await this.tagsManager({
          operation: 'reset',
        })
        return
      }

      this.search.data = await this.fetchTags(tag)
    }, 350),

    async resetTags() {
      await this.tagsManager({ operation: 'reset' })
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
    async removeTag(tag) {
      await this.tagsManager({
        operation: 'remove',
        value: [tag],
      })
    },

    async addTag(tag) {
      const prefix = this.isBanModeEnabled ? '-' : ''

      await this.tagsManager({
        operation: 'merge',
        value: [prefix + tag],
      })
    },
    // #endregion
  },
}
</script>

<style lang="postcss">
.search-grid {
  display: grid;
  grid-template-rows: 0.5fr 1fr 3fr 0.5fr;
}

@screen md {
  .search-grid {
    grid-template-columns: 1fr 2fr 3fr 1fr;
    grid-template-rows: 1fr;
  }
}
</style>
