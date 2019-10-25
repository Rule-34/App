<template>
  <div class="card-container md:w-4/5">
    <!-- POSITION ABSOLUTE AS A TEMPORAL FIX -->
    <div class="post-container text-center p-2" v-if="errors">
      <h1 class="bold" v-text="errors"></h1>
      <a href="#" @click="getPosts">Try again?</a>
    </div>
    <!-- Loop for every post -->
    <div class="post-container" v-for="post in posts" :key="post.id">
      <!-- Image -->
      <img class="post-img" v-lazy="post.file_url" v-if="post.type === 'image'" />
      <!-- Video -->
      <video
        class="post-img"
        :alt="post.type"
        v-if="post.type == 'video'"
        controls
        autoplay
        muted
        loop
      >
        <source v-lazy="post.file_url" />Your browser doesnt support HTML5 video.
      </video>
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
</template>

<script>
import axios from "axios";

export default {
  name: "latest-posts",
  // props: ["category"],
  data() {
    return {
      posts: "",
      comments: "",
      errors: ""
    };
  },
  // computed: {},
  created() {
    this.getPosts();
  },
  methods: {
    getPosts: async function(url) {
      // Reset errors cause we're trying again
      this.errors = "";

      try {
        const response = await axios.get(
          "https://r34-json.herokuapp.com/posts"
        );
        this.posts = response.data.posts;
        // console.log(response);
      } catch (error) {
        // console.error(error);
        this.errors = error;
      }
    }
  }
};
</script>

