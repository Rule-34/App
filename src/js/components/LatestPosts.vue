<template>
  <div class="card-container md:w-4/5">
    <!-- Loop for every post -->
    <div class="card-post-container" v-for="post in posts" :key="post.id">
      <!-- Image -->
      <img class="card-post-img" :src="post.file_url" :alt="post.type" />
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
          <div class="flex items-baseline overflow-hidden">
            <div class="w-2/3 small" v-if="post.tags">
              <a v-for="tag in post.tags" :key="post[tag]" target="_blank">{{tag + " "}}</a>
            </div>
            <div class="w-1/3" v-if="post.source">
              <a :href="post.source" v-text="post.source" target="_blank"></a>
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
      comments: ""
    };
  },
  // computed: {},
  created() {
    this.getPosts();
  },
  methods: {
    getPosts: async function(url) {
      try {
        const response = await axios.get(
          "https://r34-json-api.herokuapp.com/posts"
        );
        this.posts = response.data;
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    },
    getComments: async function(url) {
      try {
        const response = await axios.get(
          "https://r34-json-api.herokuapp.com/comments"
        );
        this.comments = response.data;
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

