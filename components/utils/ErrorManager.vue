<template>
  <Error v-if="errors" :error-data="errors" />
</template>

<script>
import { mapState } from 'vuex'

import Error from './Error.vue'

export default {
  name: 'ErrorManager',

  components: {
    Error,
  },

  computed: {
    ...mapState(['errors']),
  },
}
</script>
