<template>
  <!-- Controls for navigating pages -->
  <div
    :class="{ 'hover-controls-container': userSettings.hoverControls.value }"
  >
    <div
      v-if="!generalData.errors && dashBoardData"
      :class="{ 'hover-controls': userSettings.hoverControls.value }"
      class="material-container text-center p-2 flex"
    >
      <a
        href="#"
        class="w-1/3 button"
        title="Load last page"
        @click="getLastPage"
      >
        <ArrowLeftIcon class="icon w-4 h-4 inline" /> Last page
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
        <ArrowRightIcon class="icon w-4 h-4 inline" />
      </a>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";

// Import icons from package
import { ArrowLeftIcon, ArrowRightIcon } from "vue-feather-icons";

export default {
  name: "Controls",
  components: {
    ArrowRightIcon,
    ArrowLeftIcon
  },
  // Map data to the store following's
  computed: {
    ...mapState(["dashBoardData", "searchData", "generalData", "userSettings"])
  },

  methods: {
    // Map actions and mutations from store following's
    ...mapMutations(["newDashBoardData"]),
    ...mapActions(["getPosts", "pidManager", "tagManager"]),
    // Get next page from api
    getNextPage() {
      // Get next PID
      this.pidManager({
        function: "add"
      });

      // If we have tags added then load next page of tags, else load normal latest posts
      this.getPosts();
    },
    // Get last page from api
    getLastPage() {
      // Get last PID
      this.pidManager({
        function: "subtract"
      });

      // If we have tags added then load last page of tags, else load normal latest posts
      if (this.searchData.tags.length > 0) {
        this.getPosts();
      } else {
        this.getPosts();
      }
    },
    getSpecificPage() {
      // Ask for page to go to
      let specificPage = prompt("What page do you want to go to?", "69");

      // Test if something was input
      if (!isNaN(specificPage)) {
        // Set PID to indicated
        // console.log(specificPage);
        this.newDashBoardData({
          pid: specificPage
        });

        // If we have tags added then load specific page of tags, else load normal latest posts
        if (this.searchData.tags.length > 0) {
          // Load the next tag page
          this.getPosts();
        } else {
          // Or load normal posts
          this.getPosts();
        }
      } else {
        alert("Wrong input, only numbers please");
      }
    }
  }
};
</script>
