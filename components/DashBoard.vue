<template>
  <div class="card-container md:w-4/5">
    <!-- If Axios request got errors -->
    <div v-if="generalData.errors" class="post-container text-center p-2">
      <h1 class="bold" v-text="generalData.errors" />
      <a href="javascript:void(0)" @click="getPosts">Try again?</a>
    </div>
    <!-- Every post in their own component -->
    <post
      v-for="post in dashBoardData.data.posts"
      :key="post.id"
      :post-data="post"
    />

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
import post from './Post'

// Import icons from package
import { ArrowRightIcon, ArrowLeftIcon } from 'vue-feather-icons'

export default {
  name: 'DashBoard',
  components: {
    ArrowRightIcon,
    ArrowLeftIcon,
    post
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
      // Ask for page to go to
      let specificPage = prompt('What page do you want to go to?', '69')

      // Test if something was input
      if (!isNaN(specificPage)) {
        // If we have tags added then load specific page of tags, else load normal latest posts
        if (this.searchData.tags.length > 0) {
          // Set PID
          this.$store.commit('newDashBoardData', {
            pid: specificPage
          })
          // And load the next tag page
          this.$store.dispatch('getAddedTags')
        } else {
          this.getPosts()
        }
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
