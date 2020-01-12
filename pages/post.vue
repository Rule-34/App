<template>
  <div>
    <!-- If theres errors -->
    <Errors :is-single-post="true" />

    <!-- First time / Empty query info -->
    <div v-if="!id || !domain" class="material-container text-center p-2">
      <h1 class="text-default-text text-lg">You should add a query!</h1>

      <h2 class="text-default-text-muted">
        For example
        <a href="/post?id=1&domain=xxx">Post with ID 1 on domain Rule34.xxx</a>
      </h2>
    </div>

    <!-- If query loads successfully -->
    <template v-if="id && domain">
      <Post :post="dashBoardData.data[0]" />

      <div class="material-container text-center p-2 text-default-text">
        <h1>
          If this is your first time here, please enjoy the rest of the App
        </h1>

        <a href="/">Go to Dashboard</a>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
// Components
import Post from '~/components/dashboard/Post.vue'
import Errors from '~/components/general/Errors.vue'

export default {
  name: 'PostId',

  components: {
    Post,
    Errors
  },

  data() {
    return {
      id: this.$route.query.id || undefined,
      domain: this.$route.query.domain || undefined
    }
  },

  computed: {
    ...mapState(['dashBoardSettings', 'dashBoardData']),

    applyDomain() {
      return this.domainManager(this.domain)
    },
    applyPost() {
      return this.getSinglePost(this.id)
    }
  },

  // async beforeMount() {
  //   // If the domain is not supported then throw error
  //   if (
  //     this.dashBoardSettings.contentDomain === 'xxx' ||
  //     this.dashBoardSettings.contentDomain === 'paheal'
  //   ) {
  //     this.postData = await this.getSinglePost(this.id)

  //     // If not then load the domain
  //   } else {
  //     this.generalManager({
  //       errors: `The current domain "${this.dashBoardSettings.contentDomain}" doesnt support getting posts from ID`,
  //     })
  //   }
  // },

  methods: {
    ...mapActions(['getSinglePost']),
    ...mapMutations(['generalManager', 'domainManager'])
  }
}
</script>
