<template>
  <button
    aria-label="Toggle the search menu"
    class="
      relative
      flex
      items-center
      justify-center
      w-10
      h-10
      p-3
      border-0
      rounded-full
      md:w-12 md:h-12
      bg-gradient-to-t
      from-primary-400
      to-accent-400
      focus:focus-util
      shadow
    "
    title="Search"
    type="menu"
    @click="toggleSearch"
  >
    <!-- Search Icon -->
    <SearchIcon class="icon"/>

    <!-- Tag count badge -->
    <template v-if="tagCount > 0">

      <div class="absolute -top-2 -right-2">

        <p
          class="text-gray-200 text-sm font-medium bg-darkGray-700 border-[0.15rem] border-accent-500 rounded-full px-1.5">
          {{ tagCount }}

          <span class="sr-only">
            tags active
          </span>
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
    SearchIcon,
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
      'searchNavigationManager',
    ]),

    toggleSearch() {
      this.searchNavigationManager({ operation: 'toggle' })
    },
  },
}
</script>
