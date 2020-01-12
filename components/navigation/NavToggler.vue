<template>
  <!-- Side Nav Toggler -->
  <div class="navigation-toggler">
    <button
      @click="sideNavManager()"
      class="navigation-toggler-button"
      type="button"
      title="Menu"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      @click="searchManager({ isActive: !searchData.isActive })"
      type="button"
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
    ...mapMutations(['searchManager', 'sideNavManager'])
  }
}
</script>
