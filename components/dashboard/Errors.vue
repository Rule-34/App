<template>
  <!-- If theres request got errors -->
  <div
    v-if="generalData.errors !== null || dashBoardData.data.count === '0'"
    class="material-container text-center p-2"
  >
    <template v-if="generalData.errors">
      <h1 class="bold" v-text="generalData.errors" />
      <a href="javascript:void(0)" @click="getPosts()">Try again?</a>
    </template>

    <template v-else-if="dashBoardData.data.count === '0'">
      <h1 class="bold" v-text="'Nothing found'" />
      <a href="javascript:void(0)" @click="tagManager({ function: 'reset' })"
        >Reset tags?</a
      >
    </template>

    <!-- Not useful -->
    <!-- <template v-else-if="!searchData.data.length">
      <h1 class="bold" v-text="'No tags found'" />
      <a href="javascript:void(0)" @click="tagManager({ function: 'reset' })"
        >Reset tags?</a
      >
    </template> -->
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "DashBoard",
  components: {},
  // Get data() from vuex stores
  computed: {
    ...mapState(["generalData", "dashBoardData"])
  },
  methods: {
    ...mapActions(["getPosts", "pidManager", "tagManager", "testForErrors"])
  }
};
</script>
