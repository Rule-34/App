<template>
  <!-- Side Nav Toggler -->
  <div class="navigation-toggler fixed z-50">
    <button
      class="navigation-toggler-button w-12 h-12 m-4 bg-gradient-lilac-blue rounded-full shadow-lg select-none block"
      title="Menu"
      @click="sideNavManager({ operation: 'toggle' })"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      class="navigation-search-button w-10 h-10 m-5 bg-gradient-blue-lilac rounded-full shadow-lg select-none block"
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

  computed: {
    ...mapState(["searchData"])
  },
  methods: {
    ...mapMutations(["newSearchData", "sideNavManager"])
  }
};
</script>
