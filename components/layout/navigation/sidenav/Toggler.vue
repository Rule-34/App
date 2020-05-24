<template>
  <!-- Side Nav Toggler -->
  <div class="navigation-toggler fixed z-50">
    <button
      class="w-12 md:w-16 h-12 md:h-16 m-4 md:m-2 rounded-full shadow-lg select-none block bg-gradient-lilac-blue"
      type="button"
      title="Menu"
      @click="sideNavManager()"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      type="button"
      class="w-10 md:w-12 h-10 md:h-12 m-5 md:m-4 rounded-full shadow-lg select-none block bg-gradient-lilac-blue"
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
    ...mapState(['searchData']),
  },

  methods: {
    ...mapMutations(['searchManager', 'sideNavManager']),
  },
}
</script>

<style lang="postcss">
.navigation-toggler {
  top: 25px;
  transform: translateX(-35px);
  transition: var(--transition--transform);
}

.navigation-toggler:hover {
  transform: translateX(1vw);
}

/* Changes for medium screens */
@screen md {
  .navigation-toggler {
    transform: translateX(1vw);
  }
}
</style>
