<template>
  <!-- Side Nav Toggler -->
  <v-container class="navigation-toggler">
    <button
      @click="$emit('toggle-sidenav')"
      class="navigation-toggler-button"
      title="Menu"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      @click="$emit('toggle-search')"
      class="navigation-search-button"
      title="Search"
    >
      <!-- Search Icon -->
      <v-icon medium color="white">{{ mdiMagnify }}</v-icon>
    </button>
  </v-container>
</template>

<script>
import { mdiMagnify } from '@mdi/js'

export default {
  name: 'NavToggler',
  props: { showSearch: { type: Boolean, default: false, required: false } },

  data() {
    return { mdiMagnify }
  }
}
</script>
