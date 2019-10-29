<template>
  <div class="card-container md:w-4/5">
    <!-- If Axios request got errors -->
    <div class="post-container text-center p-2" v-if="latestPostsData.errors">
      <h1 class="bold" v-text="latestPostsData.errors"></h1>
      <a href="#" @click="getPosts">Try again?</a>
    </div>
    <!-- Test for api data before rendering anything -->
    <div v-if="latestPostsData">
      <!-- Loop for every post -->
      <div class="post-container" v-for="post in latestPostsData.data.posts" :key="post.id">
        <!-- Image -->
        <img class="post-img" v-lazy="post.file_url" v-if="post.type === 'image'" />
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
            <div class="flex items-baseline overflow-hidden text-sm">
              <div class="w-5/6 pr-1 truncate" v-if="post.tags">
                <a
                  v-for="tag in post.tags"
                  :key="post[tag]"
                  rel="noreferrer"
                  target="_blank"
                >{{tag + "&nbsp;"}}</a>
              </div>
              <div class="w-1/6 pl-1 text-right" v-if="post.source">
                <a :href="post.source" rel="noreferrer" target="_blank">Source</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Controls for next and last pages -->
    <div
      class="post-container text-center p-2 flex"
      v-if="!latestPostsData.errors && latestPostsData"
    >
      <a href="#" class="w-1/3 button" title="Load last page" @click="getLastPage">&lt; Last page</a>
      <a
        href="#"
        class="w-1/3"
        title="Load specific page"
        v-text="latestPostsData.pid"
        @click="getSpecificPage"
      ></a>
      <a href="#" class="w-1/3 button" title="Load next page" @click="getNextPage">Next page &gt;</a>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "latest-posts",
  // Get data() from vuex store "latestPostsData"
  computed: mapState(["latestPostsData"]),

  // Get posts as fast as possible
  beforeMount() {
    this.getPosts();
  },
  methods: {
    // Get posts from api
    getPosts() {
      // console.log(`${this.latestPostsData.pid} GET`);
      this.$store.dispatch("axiosGet", {
        url: `posts?pid=${this.latestPostsData.pid}&limit=20`,
        mutationToReturn: "newLatestPostsData"
      });
    },
    // Get next page from api
    getNextPage() {
      this.$store.commit("newLatestPostsData", {
        pid: parseInt(this.latestPostsData.pid) + 1
      });
      this.getPosts();
    },
    // Get last page from api
    getLastPage() {
      this.$store.commit("newLatestPostsData", {
        pid: parseInt(this.latestPostsData.pid) - 1
      });
      this.getPosts();
    },
    getSpecificPage() {
      let specificPage = prompt("What page do you want to go to?", "69");
      if (!isNaN(specificPage)) {
        this.$store.commit("newLatestPostsData", {
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