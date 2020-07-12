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
        @click="resetAddedTags()"
      >
        <TrashIcon
          class="w-6 h-6 icon hover:text-default-text-muted transition--color"
        />
      </button>

      <!-- Filter content -->
      <button
        type="button"
        title="Filter out content"
        @click="toggleBlacklistFilter()"
      >
        <FilterIcon
          :class="{ 'text-red-400': search.blacklistFilter.isActive }"
          class="w-6 h-6 icon transition--color"
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
    ...mapState('booru', ['search']),
  },

  methods: {
    ...mapActions('booru', [
      'addedTagsManager',
      'searchedTagsManager',
      'fetchSearchTag',
    ]),
    ...mapMutations('booru', ['setBlacklistFilterActive']),

    replaceInput(event) {
      this.searchQuery = event.target.value.replace(/\s+/g, '_').toLowerCase()
      event.target.value = this.searchQuery

      this.getTags()
    },

    addSearchedTagDirectly(tag) {
      this.addedTagsManager({
        operation: 'add',
        tag: {
          name: tag,
        },
      })
    },

    getTags: debounce(function () {
      if (this.searchQuery.length > 2) {
        this.fetchSearchTag(this.searchQuery)
      } else {
        this.searchedTagsManager({
          operation: 'reset',
        })
      }
    }, 350),

    resetAddedTags() {
      this.addedTagsManager({ operation: 'reset' })
    },

    toggleBlacklistFilter() {
      this.setBlacklistFilterActive(!this.search.blacklistFilter.isActive)
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
