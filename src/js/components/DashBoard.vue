<template>
  <div class="card-container md:w-4/5">
    <!-- If Axios request got errors -->
    <div class="post-container text-center p-2" v-if="dashBoardData.errors">
      <h1 class="bold" v-text="dashBoardData.errors"></h1>
      <a href="#" @click="getPosts">Try again?</a>
    </div>
    <!-- Test for api data before rendering anything -->
    <div v-if="dashBoardData">
      <!-- Loop for every post -->
      <div class="post-container" v-for="post in dashBoardData.data.posts" :key="post.id">
        <!-- style="max-height: 80vh;" -->
        <!-- Image -->
        <img class="post-img" :alt="post.type" v-lazy="post.file_url" v-if="post.type === 'image'" />
        <!-- :style="{height: post.height + 'px'}" -->

        <!-- Video -->
        <lazy-component v-if="post.type == 'video'">
          <video class="post-img" :alt="post.type" controls autoplay muted loop>
            <source :src="post.file_url" />Your browser doesnt support HTML5 video.
          </video>
        </lazy-component>

        <!-- Details like comments, tags and source -->
        <div class="p-6">
          <div class="card-post-details">
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
              <div class="w-full md:w-11/12 tag-container" v-if="post.tags">
                <a class="tag" v-for="tag in post.tags" :key="post[tag]" v-text="tag"></a>
              </div>
              <!-- Source -->
              <div class="w-full mt-3 -m-1 text-center md:w-1/12 md:m-auto" v-if="post.source">
                <a
                  class="inline-flex items-baseline"
                  :href="post.source"
                  rel="noreferrer noopener nofollow"
                  target="_blank"
                >
                  <p>Source</p>
                  <external-link-icon class="icon ml-2 text-black w-4 h-4"></external-link-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls for navigating pages -->
    <div class="post-container text-center p-2 flex" v-if="!dashBoardData.errors && dashBoardData">
      <a href="#" class="w-1/3 button" title="Load last page" @click="getLastPage">
        <arrow-left-icon class="icon w-4 h-4 inline"></arrow-left-icon>Last page
      </a>
      <a
        href="#"
        class="w-1/3"
        title="Load specific page"
        v-text="dashBoardData.pid"
        @click="getSpecificPage"
      ></a>
      <a href="#" class="w-1/3 button" title="Load next page" @click="getNextPage">
        Next page
        <arrow-right-icon class="icon w-4 h-4 inline"></arrow-right-icon>
      </a>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

// Icons
import {
  ExternalLinkIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from "vue-feather-icons";

export default {
  name: "dash-board",
  components: {
    ExternalLinkIcon,
    ArrowRightIcon,
    ArrowLeftIcon
  },
  // Get data() from vuex store "dashBoardData"
  computed: mapState(["dashBoardData", "generalData"]),

  // Get posts as fast as possible
  beforeMount() {
    this.getPosts();
  },
  methods: {
    // Get posts from api
    getPosts() {
      // console.log(`${this.dashBoardData.pid} GET`);
      this.$store.dispatch("axiosGet", {
        url: `posts?pid=${this.dashBoardData.pid}&limit=${this.generalData.limit}`,
        mutationToReturn: "newDashBoardData"
      });
    },
    // Get next page from api
    getNextPage() {
      this.$store.commit("newDashBoardData", {
        pid: parseInt(this.dashBoardData.pid) + 1
      });
      this.getPosts();
    },
    // Get last page from api
    getLastPage() {
      this.$store.commit("newDashBoardData", {
        pid: parseInt(this.dashBoardData.pid) - 1
      });
      this.getPosts();
    },
    getSpecificPage() {
      let specificPage = prompt("What page do you want to go to?", "69");
      if (!isNaN(specificPage)) {
        this.$store.commit("newDashBoardData", {
          pid: specificPage
        });
        this.getPosts();
      } else {
        alert("Wrong input, only numbers please");
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
  },

  mounted() {
    // this.scroll();
  }
};
</script>