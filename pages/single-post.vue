<template>
  <main>
    <!-- If theres errors -->
    <Errors :is-single-post="true" />

    <!-- First time / Empty query info -->
    <div v-if="!id || !domain" class="material-container text-center p-2">
      <h1 class="text-default-text text-lg">You should add a query!</h1>

      <h2 class="text-default-text-muted">
        For example
        <a href="/post?domain=xxx&id=1">Post with ID 1 on domain Rule34.xxx</a>
      </h2>
    </div>

    <!-- If query loads successfully -->
    <template v-if="id && domain">
      <!-- Post -->
      <Post :post="dashBoardData.data[0]" />

      <!-- Call to action -->
      <div class="text-center text-default-text m-5">
        <h1>
          If this is your first time here, please enjoy the rest of the Rule 34
          App
        </h1>

        <nuxt-link to="/">
          <button
            class="color-util border-util bg-elevation rounded-full py-2 px-4 mt-3"
          >
            Go to Dashboard
          </button>
        </nuxt-link>
      </div>
    </template>
  </main>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
// Components
import Post from '~/components/components/post/Post.vue'
import Errors from '~/components/general/Errors.vue'

import {
  findBoorusWithValueByKey,
  booruTypeList,
} from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export default {
  name: 'SinglePost',

  components: {
    Post,
    Errors,
  },

  data() {
    return {
      id: this.$route.query.id,
      domain: this.$route.query.domain,
      type: this.$route.query.type,
    }
  },

  computed: {
    ...mapState(['dashBoardData', 'booruData']),
  },

  async mounted() {
    // Search for the domain
    const booruData = findBoorusWithValueByKey(
      this.domain,
      'domain',
      this.booruData.boorus
    )[0]

    // Check if domain data exists
    if (!booruData) {
      this.errorManager({
        operation: 'set',
        data: new Error(`The current domain "${this.domain}" couldnt be found`),
      })
      return
    }

    // Check if type exists and add it if not
    if (!this.type)
      this.type = findBoorusWithValueByKey(
        booruData.type,
        'type',
        booruTypeList
      )[0].type

    // Check if type exists for that domain
    if (!this.type.singlePost) {
      this.errorManager({
        operation: 'set',
        data: new Error(
          `The current domain type "${this.type}" doesnt support getting posts from ID`
        ),
      })
      return
    }

    // Use query domain
    await this.booruDataManager(this.domain)

    // And then get the post
    await this.fetchWithMode({
      mode: 'single-post',
      returnMode: 'add',
      postID: this.id,
    })
  },

  methods: {
    ...mapActions(['fetchWithMode']),
    ...mapMutations(['errorManager', 'booruDataManager']),
  },

  head() {
    return {
      title: 'Single post',
      meta: [
        {
          hid: 'singlepost',
          name: 'description',
          content: 'Share your favorite images with the Rule 34 App.',
        },
      ],
    }
  },
}
</script>
