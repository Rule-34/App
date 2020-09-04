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

    <div class="flex">
      <!-- Premade filter -->
      <!-- TODO: Remake functionality -->
      <!-- <button type="button" title="Premade filter" @click="addPremadeTags()">
        <GitlabIcon
          class="w-6 h-6 transition-colors duration-300 icon hover:text-default-text-muted"
        />
      </button> -->

      <!-- Reset tags -->
      <button
        class="mx-2"
        type="button"
        title="Reset tags"
        @click="resetAddedTags()"
      >
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon, SearchIcon, FilterIcon, TrashIcon } from 'vue-feather-icons'
import debounce from 'lodash/debounce'

export default {
  name: 'SearchBar',

  components: { SearchIcon, FilterIcon, TrashIcon },

  data() {
    return {
      searchQuery: null,
    }
  },

  computed: {
    ...mapGetters('navigation', [
      'isNegativeTagsActive',
    ]),
    ...mapGetters('premium', ['isUserPremium']),
  },

  methods: {
    ...mapActions('booru', [
      'addedTagsManager',
      'searchedTagsManager',
      'fetchSearchTag',
    ]),
    ...mapActions('navigation', [
      'negativeTagsManager',
    ]),

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

    },
  },
}
</script>
