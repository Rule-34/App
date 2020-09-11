<template>
  <!-- Search bar -->
  <div class="flex p-2 my-auto material-container bg-background">
    <!-- Search Icon -->
    <SearchIcon class="w-6 h-6 icon text-default" />

    <!-- Input form -->
    <!-- Overflow Hidden is very important -->
    <!-- Input because v-model/:value doesnt work on mobile -->
    <input
      class="flex-1 mx-2 overflow-hidden font-light outline-none text-default-text bg-background"
      type="search"
      name="tags"
      placeholder="Search: e.g. dragon"
      @input="replaceInput($event)"
      @keypress.enter.prevent="addSearchedTagDirectly($event.target.value)"
    />

    <div class="flex space-x-1">
      <!-- Tag collections -->
      <button
        type="button"
        title="Custom Tag Collections"
        @click="toggleTagCollections()"
      >
        <TagIcon
          class="w-6 h-6 transition-colors duration-300 icon hover:text-default-text-muted"
        />
      </button>

      <!-- Reset -->
      <button type="button" title="Reset tags" @click="resetAddedTags()">
        <TrashIcon
          class="w-6 h-6 transition-colors duration-300 icon hover:text-default-text-muted"
        />
      </button>

      <!-- Negative -->
      <button
        type="button"
        title="Filter out content"
        @click="toggleNegativeTags()"
      >
        <FilterIcon
          :class="{ 'text-red-400': isNegativeTagsActive }"
          class="w-6 h-6 transition-colors duration-300 icon"
        />
      </button>
    </div>

    <transition name="page">
      <SearchTagCollections
        v-if="tagCollections.isActive"
        class="absolute inset-0 z-30 bg-black bg-opacity-25"
        @toggleTagCollections="toggleTagCollections()"
      />
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon, SearchIcon, FilterIcon, TrashIcon } from 'vue-feather-icons'
import debounce from 'lodash/debounce'

const SearchTagCollections = () => import('./SearchTagCollections')

export default {
  name: 'SearchBar',

  components: {
    TagIcon,
    SearchIcon,
    FilterIcon,
    TrashIcon,
    SearchTagCollections,
  },

  data() {
    return {
      searchQuery: null,

      tagCollections: { isActive: false },
    }
  },

  computed: {
    ...mapGetters('navigation', ['isNegativeTagsActive']),
    ...mapGetters('premium', ['isUserPremium']),
  },

  methods: {
    ...mapActions('booru', [
      'addedTagsManager',
      'searchedTagsManager',
      'fetchSearchTag',
    ]),
    ...mapActions('navigation', ['negativeTagsManager']),

    replaceInput(event) {
      this.searchQuery = event.target.value.replace(/\s+/g, '_')

      event.target.value = this.searchQuery

      this.getTags()
    },

    addSearchedTagDirectly(tag) {
      this.addedTagsManager({
        operation: 'add',
        value: tag,
      })
    },

    getTags: debounce(function () {
      if (this.searchQuery.length < 2) {
        this.searchedTagsManager({
          operation: 'reset',
        })
        return
      }

      this.fetchSearchTag(this.searchQuery)
    }, 350),

    resetAddedTags() {
      this.addedTagsManager({ operation: 'reset' })
    },

    toggleNegativeTags() {
      this.negativeTagsManager({ operation: 'toggle' })
    },

    toggleTagCollections() {
      if (!this.isUserPremium) {
        this.$router.push({ name: 'premium' })
        return
      }

      this.tagCollections.isActive = !this.tagCollections.isActive
    },
  },
}
</script>
