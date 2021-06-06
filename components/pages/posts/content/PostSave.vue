<template>
  <button
    type="button"
    class="flex items-center gap-2 my-2 link group"
    @click="savePostHandler"
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

    isPostSaved() {
      const savedPosts = this.getSavedPosts

      const domain = this.postDomain
      const postData = this.postData

      if (!savedPosts.hasOwnProperty(domain)) {
        return false
      }

      const isPostSaved = savedPosts[domain].some(
        (post) => post.data.id === postData.id
      )

      return isPostSaved
    },
  },

  methods: {
    ...mapActions('user', [
      'addPostToSavedPosts',
      'removePostFromSavedPosts',
      'isPostInSavedPosts',
    ]),

    async savePostHandler() {
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
