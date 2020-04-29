<template>
  <!-- Search bar -->
  <div class="flex material-container bg-background p-2 my-auto">
    <!-- Search Icon -->
    <SearchIcon class="icon text-default w-6 h-6" />

    <!-- Input form -->
    <!-- Overflow Hidden is very important -->
    <input
      v-model="searchQuery"
      class="flex-1 text-default-text font-light bg-background mx-2 overflow-hidden"
      type="search"
      name="tags"
      placeholder="Search: e.g. dragon"
      @keypress.enter.prevent="
        // Add tag directly to the store
        tagManager({
          operation: 'add',
          tag: {
            name: $event.target.value,
          },
        })
      "
    />
    <div class="flex">
      <button type="button" title="Premade filter" @click="addPremadeTags()">
        <!-- Premade filter -->
        <GitlabIcon
          class="icon w-6 h-6 hover:text-default-text-muted transition--color"
        />
      </button>

      <!-- Reset tags -->
      <button
        class="mx-2"
        type="button"
        title="Reset tags"
        @click="resetTags()"
      >
        <TrashIcon
          class="icon w-6 h-6 hover:text-default-text-muted transition--color"
        />
      </button>

      <!-- Filter content -->
      <button type="button" title="Filter out content" @click="toggleFilter()">
        <FilterIcon
          :class="{ 'text-red-400': searchData.isFilterActive }"
          class="icon w-6 h-6 transition--color"
        />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import {
  FilterIcon,
  SearchIcon,
  TrashIcon,
  GitlabIcon,
} from 'vue-feather-icons'
import debounce from 'lodash/debounce'

export default {
  name: 'SearchBar',

  components: { SearchIcon, FilterIcon, TrashIcon, GitlabIcon },

  data() {
    return {
      searchQuery: '',
    }
  },

  computed: {
    ...mapState(['searchData']),
  },

  watch: {
    searchQuery() {
      this.getTags()
    },
  },

  methods: {
    ...mapMutations(['searchManager', 'tagManager']),
    ...mapActions(['fetchWithMode']),

    resetTags() {
      this.tagManager({ operation: 'reset' })
    },

    getTags: debounce(function () {
      if (this.searchQuery.length > 2) {
        this.fetchWithMode({
          mode: 'tags',
          tag: this.searchQuery,
        })
      } else {
        // Remove search data cause search limit is 3 characters
        this.searchManager({
          mode: 'changeData',
          data: [],
        })
      }
    }, 350),

    toggleFilter() {
      this.searchManager({
        mode: 'toggleFilter',
      })
    },

    async addPremadeTags() {
      // Populate filterData data and reuse later
      if (!this.searchData.premadeFilterData.length) {
        await this.fetchWithMode({
          mode: 'filter',
        })
      }

      this.tagManager({
        operation: 'concat',
      })
    },
  },
}
</script>

<style>
/* Initial state */
.search-enter,
.search-leave-to {
  transform: translateX(100vw);
}

/* Toggled stated */
.search-enter-to {
  transform: translateX(0px);
}

/* Transition that is gonna be applied */
.search-enter-active,
.search-leave-active {
  transition-property: transform;
  transition-duration: 0.35s;
  transition-timing-function: ease-in-out;
}
</style>
