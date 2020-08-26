<template>
  <Error v-if="errors" />
</template>

<script>
import { mapState } from 'vuex'

import Error from './Error'

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
