<template>
  <!-- Side Nav Toggler -->
  <div class="navigation-toggler">
    <button
      class="navigation-toggler-button"
      title="Menu"
      @click="$emit('toggle-sidenav')"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearchBar"
      class="navigation-search-button"
      title="Search"
      @click="newSearchData({ isActive: !searchData.isActive })"
    >
      <!-- Search Icon -->
      <SearchIcon class="icon text-white w-6 h-6 inline-flex" />
    </button>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { SearchIcon } from "vue-feather-icons";

export default {
  name: "NavToggler",
  components: { SearchIcon },
  props: { showSearch: { type: Boolean, default: true, required: false } },

  data() {
    return { showSearchBar: true };
  },

  computed: {
    ...mapState(["searchData"])
  },

  mounted() {
    this.showSearchBar = this.showSearch;
  },

  methods: {
    ...mapMutations(["newSearchData", "sideNavManager"])
  }
};
</script>
