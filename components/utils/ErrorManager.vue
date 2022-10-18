<template>
  <Error v-if="getErrors" :error-data="getErrors" />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getErrors'])
  }
}
</script>
