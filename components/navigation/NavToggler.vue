<template>
  <!-- Side Nav Toggler -->
  <div class="navigation-toggler">
    <button
      @click="$emit('toggle-sidenav')"
      class="navigation-toggler-button"
      title="Menu"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      @click="newSearchData({ isActive: !searchData.isActive })"
      class="navigation-search-button"
      title="Search"
    >
      <!-- Search Icon -->
      <SearchIcon class="icon text-white w-6 h-6 inline-flex" />
    </button>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'

export default {
  name: 'NavToggler',
  components: { SearchIcon },
  props: { showSearch: { type: Boolean, default: false, required: false } },

  computed: {
    ...mapState(['searchData'])
  },

  methods: {
    ...mapMutations(['newSearchData'])
  }
}
</script>
