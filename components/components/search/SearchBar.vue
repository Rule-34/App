<template>
  <div>
    <!-- Search bar -->
    <div class="material-container bg-background p-2 flex justify-between">
      <!-- Search Icon -->
      <div class="w-full flex">
        <SearchIcon class="icon text-default w-6 h-6 mr-2" />
        <!-- Input -->
        <input
          class="w-full text-default-text font-light bg-background outline-none ml-1"
          type="search"
          placeholder="Search: e.g. dragon"
          @input="searchQuery = $event.target.value"
        />
      </div>

      <!-- Filter content -->
      <div title="Automatic filters" @click="toggleContentMode()">
        <component
          :is="ContentMode.icon"
          :class="{
            'text-orange-400': ContentMode.mode === 'furry'
          }"
          class="icon w-6 h-6 mr-1"
        >
        </component>
      </div>

      <!-- Filter content -->
      <div title="Filter content" @click="toggleFilter()">
        <FilterIcon
          :class="{ 'text-red-400': searchData.isFilterActive }"
          class="icon w-6 h-6 mr-1"
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
  GitlabIcon
} from 'vue-feather-icons'
import debounce from 'lodash/debounce'

export default {
  name: 'SearchBar',

  // eslint-disable-next-line vue/no-unused-components
  components: { SearchIcon, FilterIcon, TrashIcon, GitlabIcon },

  data() {
    return {
      // Content from the search input
      searchQuery: '',
      ContentMode: { mode: 'reset', icon: 'TrashIcon' }
    }
  },

  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData'])
  },

  watch: {
    searchQuery: debounce(function() {
      this.getTags()
    }, 300)
  },

  methods: {
    ...mapMutations(['searchManager', 'tagManager']),
    ...mapActions(['searchTag', 'getCorsProxy']),

    async toggleContentMode() {
      // Populate filterData data and reuse later
      if (!this.searchData.premadeFilterData.length) {
        await this.getCorsProxy({
          url:
            'https://gistcdn.githack.com/VoidlessSeven7/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-furry-filter.json',
          returnTo: 'searchManager',
          returnData: 'premadeFilterData'
        })
      }

      // Then switch between modes
      switch (this.ContentMode.mode) {
        case 'reset':
          this.tagManager({ operation: 'reset' })
          // Load next mode
          this.ContentMode = { mode: 'furry', icon: 'GitlabIcon' }

          return true

        case 'furry':
          this.tagManager({
            operation: 'concat'
          })
          // Load next mode
          this.ContentMode = { mode: 'reset', icon: 'TrashIcon' }

          return true
      }
    },

    getTags() {
      if (this.searchQuery.length > 2) {
        this.searchTag(this.searchQuery.trim().toLowerCase())
      } else {
        // Remove search data cause search limit is 3 characters
        this.searchManager({
          data: ''
        })
      }
    },

    toggleFilter() {
      this.searchManager({
        mode: 'toggleFilter'
      })
    }
  }
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
