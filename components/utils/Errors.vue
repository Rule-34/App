<template>
  <!-- If theres request got errors -->
  <div
    v-if="errors"
    class="p-2 m-6 text-center material-container text-default-text"
  >
    <!-- Header -->
    <h1
      class="px-2 mx-auto mb-1 text-2xl font-bold tracking-wide border w-max-content"
    >
      Error
    </h1>

    <!-- Body -->
    <p>
      {{ errors }}
    </p>
    <button type="button" class="color-util" @click="reload()">
      Reload the page?
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Errors',

  computed: {
    ...mapState(['errors']),
  },

  // TODO: Add listeners to throw errors when offline, no post data, etc.

  methods: {
    reload() {
      location.reload()
    },
  },
}
</script>
