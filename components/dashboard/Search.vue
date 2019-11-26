<template>
  <v-navigation-drawer
    :value="isActive"
    app
    fixed
    temporary
    right
    width="100%"
    class="bg-transparent-important"
  >
    <v-container fluid fill-height>
      <v-row no-gutters class="h-full tw-mx-auto">
        <!-- Space occupier -->
        <v-col cols="12" sm="1"> </v-col>
        <!-- Search  -->
        <v-col cols="12" sm="3" class="m-auto">
          <SearchBar @filter-toggled="isFilterActive = !isFilterActive" />
        </v-col>
        <!-- Search results -->
        <v-col cols="12" sm="7" class="m-auto">
          <SearchResults />
        </v-col>

        <!-- Space occupier -->
        <v-col cols="12" sm="1"> </v-col>
      </v-row>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
import SearchBar from './SearchBar.vue'
import SearchResults from './SearchResults.vue'

export default {
  name: 'Search',
  components: {
    SearchBar,
    SearchResults
  },

  props: { isActive: { type: Boolean, required: true, default: false } },

  data() {
    return {
      isFilterActive: false
    }
  }
}
</script>
