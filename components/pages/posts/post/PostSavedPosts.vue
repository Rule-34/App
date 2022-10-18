<template>
  <button
    class="link group my-2 flex items-center gap-2"
    type="button"
    @click="savePostClickHandler"
  >
    <span class="sr-only"> Save post </span>

    <HeartIcon
      :class="{
        'fill-current text-red-500 group-hover:text-red-400': isPostSaved
      }"
      class="icon h-5 w-5"
    />

    Save
  </button>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { HeartIcon } from 'vue-feather-icons'

export default {
  props: {
    post: {
      type: Object,
      required: true
    }
  },

  components: { HeartIcon },

  computed: {
    ...mapGetters('user', ['getCustomSavedPosts']),
    ...mapGetters('premium', ['isUserPremium']),

    /**
     * This function is located here instead of in the vuex actions because we cant use `await` on a computed method.
     */
    isPostSaved() {
      const savedPosts = this.getCustomSavedPosts

      const isPostSaved = savedPosts.some((POST) => POST.id === this.post.id)

      return isPostSaved
    }
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
          postId: this.post.id
        })
      } else {
        await this.addPostToSavedPosts({
          post: this.post
        })
      }
    }
  }
}
</script>
