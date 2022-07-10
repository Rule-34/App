<template>
  <div>
    <template v-if="isUserPremium">
      <a
        :href="`https://saucenao.com/search.php?url=${mediaUrl}`"
        target="_blank"
        rel="noopener nofollow"
        class="flex items-center gap-2 my-2 link"
      >
        <span class="sr-only"> Search source of the post via SauceNAO </span>

        <SearchIcon class="w-5 h-5 icon" />

        SauceNAO
      </a>
    </template>

    <template v-else>
      <NuxtLink to="/premium" class="flex items-center gap-2 my-2 link">
        <span class="sr-only"> Search source of the post via SauceNAO </span>

        <SearchIcon class="w-5 h-5 icon" />

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
      required: true,
    },
  },

  components: { SearchIcon },

  computed: {
    ...mapGetters('premium', ['isUserPremium']),
  },
}
</script>
