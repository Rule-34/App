<template>
  <div class="card-container md:w-4/5">
    <!-- If Axios request got errors -->
    <div v-if="generalData.errors" class="post-container text-center p-2">
      <h1 class="bold" v-text="generalData.errors" />
      <a href="#" @click="getPosts">Try again?</a>
    </div>
    <!-- Test for api data before rendering anything -->
    <div>
      <!-- Loop for every post -->
      <div
        v-for="post in dashBoardData.data.posts"
        :key="post.id"
        class="post-container"
      >
        <!-- style="max-height: 80vh;" TODO: good for image previews -->
        <!-- Image -->
        <img
          v-if="post.type === 'image'"
          v-lazy="post.file_url"
          class="post-img"
          :alt="post.type"
        />
        <!-- :style="{height: post.height + 'px'}" -->

        <!-- Video -->
        <lazy-component v-if="post.type == 'video'">
          <video class="post-img" :alt="post.type" controls autoplay muted loop>
            <source :src="post.file_url" />
            Your browser doesnt support HTML5 video.
          </video>
        </lazy-component>

        <!-- Details like comments, tags and source TODO: Maybe add p-4 again -->
        <div class="p-2">
          <!-- Loop if the post has comment -->
          <!-- <div class="card-post-comments" v-if="post.has_comments">
            <div v-for="comment in comments" :key="comment.id">
              // TODO
              <div class="card-comment">
                <h5 class="card-comment-user" v-text="comment.creator"></h5>
                <h4 class="card-comment-text" v-text="comment.body"></h4>
              </div>
            </div>
          </div>-->
          <!-- Tags and source -->
          <div class="flex flex-wrap overflow-hidden text-sm">
            <!-- Tags -->
            <div v-if="post.tags" class="w-full md:w-11/12 tag-container">
              <a
                v-for="tag in post.tags"
                :key="post[tag]"
                class="tag"
                v-text="tag"
              />
            </div>
            <!-- Source -->
            <div
              v-if="post.source"
              class="w-full md:w-1/12 md:m-auto mt-3 -m-1 text-center"
            >
              <a
                class="inline-flex items-baseline"
                :href="post.source"
                rel="noreferrer noopener nofollow"
                target="_blank"
              >
                <p>Source</p>
                <external-link-icon class="icon ml-2 text-black w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls for navigating pages -->
    <div
      v-if="!generalData.errors && dashBoardData"
      class="post-container text-center p-2 flex"
    >
      <a
        href="#"
        class="w-1/3 button"
        title="Load last page"
        @click="getLastPage"
      >
        <arrow-left-icon class="icon w-4 h-4 inline" />Last page
      </a>
      <a
        href="#"
        class="w-1/3"
        title="Load specific page"
        @click="getSpecificPage"
        v-text="dashBoardData.pid"
      />
      <a
        href="#"
        class="w-1/3 button"
        title="Load next page"
        @click="getNextPage"
      >
        Next page
        <arrow-right-icon class="icon w-4 h-4 inline" />
      </a>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// Import icons from package
import {
  ExternalLinkIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from 'vue-feather-icons'

export default {
  name: 'DashBoard',
  components: {
    ExternalLinkIcon,
    ArrowRightIcon,
    ArrowLeftIcon
  },
  // Get data() from vuex stores
  computed: mapState(['dashBoardData', 'searchData', 'generalData']),

  // Get posts as fast as possible
  beforeMount() {
    this.getPosts()
  },
  methods: {
    // Get posts from api
    getPosts() {
      // console.log(`${this.dashBoardData.pid} GET`)
      this.$store.dispatch('axiosGet', {
        url: `posts?pid=${this.dashBoardData.pid}&limit=${this.generalData.postLimit}`,
        mutationToReturn: 'newDashBoardData'
      })
    },
    // Get next page from api
    getNextPage() {
      // Get next PID
      this.$store.dispatch('changePID', {
        function: 'add'
      })

      // If we have tags added then load next page of tags, else load normal latest posts
      if (this.searchData.tags.length > 0) {
        this.$store.dispatch('getAddedTags')
      } else {
        this.getPosts()
      }
    },
    // Get last page from api
    getLastPage() {
      // Get last PID
      this.$store.dispatch('changePID', {
        function: 'subtract'
      })

      // If we have tags added then load last page of tags, else load normal latest posts
      if (this.searchData.tags.length > 0) {
        this.$store.dispatch('getAddedTags')
      } else {
        this.getPosts()
      }
    },
    getSpecificPage() {
      let specificPage = prompt('What page do you want to go to?', '69')
      if (!isNaN(specificPage)) {
        this.$store.commit('newDashBoardData', {
          pid: specificPage
        })
        this.getPosts()
      } else {
        alert('Wrong input, only numbers please')
      }
    }
    // Test for bottom of page, and then load next page
    // scroll() {
    //   window.onscroll = () => {
    //     let bottomOfWindow =
    //       Math.max(
    //         window.pageYOffset,
    //         document.documentElement.scrollTop,
    //         document.body.scrollTop
    //       ) +
    //         window.innerHeight ===
    //       document.documentElement.offsetHeight;

    //     if (bottomOfWindow) {
    //       console.log("hola amigos");
    //       this.getNextPage();
    //     }
    //   };
    // }
    //
    // mounted() {
    //   // this.scroll();
    // },
  }
}
</script>
