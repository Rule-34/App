<template>
  <!-- If theres request got errors -->
  <div
    v-if="generalData.errors !== null"
    class="material-container text-center p-2"
  >
    <h1 class="bold" v-text="generalData.errors" />
    <a href="javascript:void(0)" @click="getPosts">Try again?</a>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "DashBoard",
  components: {},
  // Get data() from vuex stores
  computed: {
    ...mapState(["generalData"])
  },
  methods: { ...mapActions(["getPosts", "changePID", "getAddedTags"]) }
};
</script>
