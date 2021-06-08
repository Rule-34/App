<template>
  <button
    type="button"
    class="flex items-center gap-2 my-2 link group"
    @click="savePostClickHandler"
  >
    <span class="sr-only"> Save post </span>

    <HeartIcon
      class="w-5 h-5 icon"
      :class="{
        'fill-current text-red-500 group-hover:text-red-400': isPostSaved,
      }"
    />

    Save
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { HeartIcon } from 'vue-feather-icons'

export default {
  props: {
    postDomain: {
      type: String,
      required: true,
    },

    postData: {
      type: Object,
      required: true,
    },
  },

  components: { HeartIcon },

  computed: {
    ...mapGetters('user', ['getSavedPosts']),
    ...mapGetters('premium', ['isUserPremium']),

    /**
     * This function is located here instead of in the vuex actions because we cant use `await` on a computed method.
     */
    isPostSaved() {
      const savedPosts = this.getSavedPosts

      const domain = this.postDomain
      const postData = this.postData

      const isPostSaved = savedPosts.some(
        (POST) =>
          // Post ID
          POST.data.id === postData.id &&
          // Post Domain
          POST.meta_data.booru_domain === domain
      )

      return isPostSaved
    },
  },

  methods: {
    ...mapActions('user', ['addPostToSavedPosts', 'removePostFromSavedPosts']),

    async savePostClickHandler() {
      if (!this.isUserPremium) {
        await this.$router.push({ name: 'premium' })
        return
      }

      if (this.isPostSaved) {
        await this.removePostFromSavedPosts({
          domain: this.postDomain,
          post: this.postData,
        })
      } else {
        await this.addPostToSavedPosts({
          domain: this.postDomain,
          post: this.postData,
        })
      }
    },
  },
}
</script>
