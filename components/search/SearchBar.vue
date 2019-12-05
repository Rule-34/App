<template>
  <div>
    <!-- Search bar -->
    <div class="material-container p-2 w-3/4 flex justify-between">
      <!-- Search Icon -->
      <div class="w-full inline-flex">
        <SearchIcon class="icon text-default w-6 h-6 mr-2" />
        <!-- Input -->
        <input
          v-model="searchQuery"
          @input="debounceInput"
          class="w-full text-default font-light bg-secondary outline-none ml-1"
          type="search"
          placeholder="Search: e.g. dragon"
        />
      </div>

      <!-- Filter content -->
      <div
        :class="{
          'text-orange-400': ContentMode.mode === 'furry',
        }"
        @click="toggleContentMode()"
        title="Automatic filters"
      >
        <component :is="ContentMode.icon" class="icon w-6 h-6 mr-1" />
      </div>

      <!-- Filter content -->
      <div @click="toggleFilter()" title="Filter content">
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
      filterData: [],
      ContentMode: { mode: 'reset', icon: 'TrashIcon' },
    }
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData', 'generalData']),
  },
  methods: {
    ...mapMutations(['newSearchData']),
    ...mapActions(['tagManager', 'axiosGet', 'getApi']),

    async toggleContentMode() {
      // Populate filterData data and reuse later
      if (!this.filterData.length) {
        const filterData = await this.getApi(
          'https://gist.githubusercontent.com/VoidlessSeven7/c0b379d617b1d26c54158e90a1f096cd/raw/filter_anti_furry_r34.app.txt'
        )
        this.filterData = filterData
      }

      switch (this.ContentMode.mode) {
        case 'reset':
          this.tagManager('reset')
          this.ContentMode = { mode: 'furry', icon: 'GitlabIcon' }

          return true

        case 'furry':
          this.newSearchData({
            tag: {
              name: this.filterData,
              operation: 'concat',
            },
          })
          this.ContentMode = { mode: 'reset', icon: 'TrashIcon' }

          return true
      }
    },
    getTags() {
      if (this.searchQuery.length > 2) {
        this.axiosGet({
          url: `tags?tag=${this.searchQuery.trim().toLowerCase()}&limit=${
            this.generalData.postLimit
          }`,
          mutationToReturn: 'newSearchData',
        })
      } else {
        // Remove search data cause search limit is 3 characters
        this.newSearchData({
          data: '',
        })
      }
    },
    debounceInput: debounce(function() {
      this.getTags()
      // console.log("hola");
    }, 300),
    toggleFilter() {
      this.newSearchData({
        isFilterActive: !this.searchData.isFilterActive,
      })
    },
  },
}
</script>
