<template>
  <div>
    <!-- Search bar -->
    <div class="material-container tw-p-2 tw-flex tw-justify-between">
      <!-- Search Icon -->
      <div class="w-full inline-flex">
        <v-icon v-text="mdiMagnify" color="black" />
        <!-- Input -->
        <input
          v-model="searchQuery"
          @input="debounceInput"
          class="w-full ml-1 outline-none font-light"
          type="search"
          placeholder="Search: e.g. dragon"
        />
      </div>

      <!-- Automatic filter -->
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <div v-on="on" @click="toggleContentMode()">
            <v-icon
              :class="{
                'orange--text': ContentMode.mode === 'furry'
              }"
              v-text="ContentMode.icon"
            />
          </div>
        </template>
        <span>Delete tags / automatic filter</span>
      </v-tooltip>

      <!-- Filter content -->
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <div v-on="on" @click="toggleFilter">
            <v-icon
              v-text="mdiFilterOutline"
              :class="{ 'red--text': searchData.isFilterActive }"
              class="text--lighten-1"
            />
          </div>
        </template>
        <span>Filter content out</span>
      </v-tooltip>

      <!--  -->
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import {
  mdiMagnify,
  mdiFilterOutline,
  mdiTrashCanOutline,
  mdiGitlab
} from '@mdi/js'
import debounce from 'lodash/debounce'

export default {
  name: 'SearchBar',
  data() {
    return {
      // Content from the search input
      searchQuery: '',
      filterData: [],
      ContentMode: { mode: 'reset', icon: mdiTrashCanOutline },
      mdiFilterOutline,
      mdiMagnify,
      mdiTrashCanOutline,
      mdiGitlab
    }
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData', 'generalData'])
  },
  methods: {
    ...mapMutations(['newSearchData']),
    ...mapActions(['tagManager', 'axiosGet']),

    async toggleContentMode() {
      // Populate filterData data and reuse later
      if (!this.filterData.length) {
        const filterData = await this.$axios.$get(
          'https://gist.githubusercontent.com/VoidlessSeven7/c0b379d617b1d26c54158e90a1f096cd/raw/filter_anti_furry_r34.app.txt'
        )
        this.filterData = filterData
      }

      switch (this.ContentMode.mode) {
        case 'reset':
          this.tagManager({ operation: 'reset' })
          this.ContentMode = { mode: 'furry', icon: mdiGitlab }

          return true

        case 'furry':
          this.newSearchData({
            tag: {
              name: this.filterData,
              operation: 'concat'
            }
          })
          this.ContentMode = { mode: 'reset', icon: mdiTrashCanOutline }

          return true
      }
    },
    getTags() {
      if (this.searchQuery.length > 2) {
        this.axiosGet({
          url: `tags?name=${this.searchQuery.trim().toLowerCase()}*&limit=${
            this.generalData.postLimit
          }&order_by=posts`,
          mutationToReturn: 'newSearchData'
        })
      } else {
        // Remove search data cause search limit is 3 characters
        this.newSearchData({
          data: ''
        })
      }
    },
    debounceInput: debounce(function() {
      this.getTags()
      // console.log("hola");
    }, 300),
    toggleFilter() {
      this.newSearchData({
        isFilterActive: !this.searchData.isFilterActive
      })
    }
  }
}
</script>
