<template>
  <Error v-if="getErrors" :error-data="getErrors" />
</template>

<script>
import { mapGetters } from 'vuex'

import Error from './Error.vue'

export default {
  components: {
    Error,
  },

  computed: {
    ...mapGetters(['getErrors']),
  },
}
</script>
