<template>
  <div>
    <!-- If theres request got errors -->
    <Errors />

    <Post :post="postData[0]" />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
// Components
import Post from '~/components/dashboard/Post.vue'
import Errors from '~/components/general/Errors'

export default {
  name: 'PostId',

  components: {
    Post,
    Errors,
  },

  data() {
    return {
      id: this.$route.params.id,
      postData: {},
    }
  },

  computed: {
    ...mapState(['dashBoardSettings']),
  },

  async beforeMount() {
    // If the domain is not supported then throw error
    if (
      this.dashBoardSettings.contentDomain === 'xxx' ||
      this.dashBoardSettings.contentDomain === 'paheal'
    ) {
      this.postData = await this.getSinglePost(this.id)

      // If not then load the domain
    } else {
      this.generalManager({
        errors: `The current domain "${this.dashBoardSettings.contentDomain}" doesnt support getting posts from ID`,
      })
    }
  },

  methods: {
    ...mapActions(['getSinglePost']),
    ...mapMutations(['generalManager']),
  },
}
</script>
