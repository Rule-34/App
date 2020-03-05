<template>
  <!-- Side Nav Toggler -->
  <div class="navigation-toggler">
    <button
      class="navigation-toggler-button"
      type="button"
      title="Menu"
      @click="sideNavManager()"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      type="button"
      class="navigation-search-button"
      title="Search"
      @click="searchManager({ mode: 'toggleSearch' })"
    >
      <!-- Search Icon -->
      <SearchIcon class="icon text-default w-6 h-6 inline-flex" />
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
