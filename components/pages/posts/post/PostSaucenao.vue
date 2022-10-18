<template>
  <div>
    <template v-if="isUserPremium">
      <a
        :href="`https://saucenao.com/search.php?url=${mediaUrl}`"
        target="_blank"
        rel="noopener nofollow"
        class="link my-2 flex items-center gap-2"
      >
        <span class="sr-only"> Search source of the post via SauceNAO </span>

        <SearchIcon class="icon h-5 w-5" />

        SauceNAO
      </a>
    </template>

    <template v-else>
      <NuxtLink to="/premium" class="link my-2 flex items-center gap-2">
        <span class="sr-only"> Search source of the post via SauceNAO </span>

        <SearchIcon class="icon h-5 w-5" />

        SauceNAO
      </NuxtLink>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'

export default {
  props: {
    mediaUrl: {
      type: String,
      required: true
    }
  },

  components: { SearchIcon },

  computed: {
    ...mapGetters('premium', ['isUserPremium'])
  }
}
</script>
