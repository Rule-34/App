<template>
  <div>
    <!-- Search bar -->
    <div class="material-container bg-background p-2 flex justify-between">
      <!-- Search Icon -->
      <div class="w-full flex">
        <SearchIcon class="icon text-default w-6 h-6 mr-2" />
        <!-- Input form -->
        <input
          class="w-full text-default-text font-light bg-background outline-none ml-1"
          type="search"
          placeholder="Search: e.g. dragon"
          @input="searchQuery = $event.target.value"
        />
      </div>

      <!-- Premade filter -->
      <div title="Premade filter" @click="addPremadeTags()">
        <GitlabIcon
          class="icon w-6 h-6 mr-1 hover:text-orange-400 transition--color"
        />
      </div>

      <!-- Reset tags -->
      <div title="Reset tags" @click="resetTags()">
        <TrashIcon
          class="icon w-6 h-6 mr-1 hover:text-default-text-muted transition--color"
        />
      </div>

      <!-- Filter content -->
      <div title="Filter out content" @click="toggleFilter()">
        <FilterIcon
          :class="{ 'text-red-400': searchData.isFilterActive }"
          class="icon w-6 h-6 mr-1 hover:text-red-400 transition--color"
        />
      </div>
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
      // Content from the search input
      searchQuery: '',
      ContentMode: { mode: 'reset', icon: 'TrashIcon' },
    }
  },

  computed: {
    ...mapState(['searchData']),
  },

  watch: {
    searchQuery: debounce(function () {
      this.getTags()
    }, 300),
  },

  methods: {
    ...mapMutations(['searchManager', 'tagManager']),
    ...mapActions(['fetchWithMode']),

    resetTags() {
      this.tagManager({ operation: 'reset' })
    },

    getTags() {
      if (this.searchQuery.length > 2) {
        this.fetchWithMode({
          mode: 'tags',
          tag: this.searchQuery.trim().toLowerCase(),
        })
      } else {
        // Remove search data cause search limit is 3 characters
        this.searchManager({
          mode: 'changeData',
          data: '',
        })
      }
    },

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
