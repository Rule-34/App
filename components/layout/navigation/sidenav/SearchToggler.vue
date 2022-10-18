<template>
  <button
    aria-label="Toggle the search menu"
    class="focus:focus-util relative flex h-10 w-10 items-center justify-center rounded-full border-0 bg-gradient-to-t from-primary-400 to-accent-400 p-3 shadow md:h-12 md:w-12"
    title="Search"
    type="menu"
    @click="toggleSearch"
  >
    <!-- Search Icon -->
    <SearchIcon class="icon" />

    <!-- Tag count badge -->
    <template v-if="tagCount > 0">
      <div class="absolute -top-2 -right-2">
        <p
          class="rounded-full border-[0.15rem] border-accent-500 bg-darkGray-700 px-1.5 text-sm font-medium text-gray-200"
        >
          {{ tagCount }}

          <span class="sr-only"> tags active </span>
        </p>
      </div>
    </template>
  </button>
</template>

<script>
import { SearchIcon } from 'vue-feather-icons'
import { mapActions } from 'vuex'

export default {
  name: 'SearchToggler',

  components: {
    SearchIcon
  },

  props: {
    tagCount: {
      type: Number,
      required: true
    }
  },

  methods: {
    ...mapActions('navigation', [
      'sideNavNavigationManager',
      'searchNavigationManager'
    ]),

    toggleSearch() {
      this.searchNavigationManager({ operation: 'toggle' })
    }
  }
}
</script>
