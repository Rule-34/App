<template>
  <div class="search-bar" :class="{active: searchData.isActive}">
    <div class="flex h-screen bg-black-10">
      <div class="post-container p-2 m-auto">
        <input
          class="outline-none inline-block border-r-2"
          type="search"
          placeholder="Search: eg. dragons"
        />
        <button class="inline-block pl-1" type="submit">Search</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "search-bar",
  // Get data() from vuex store "searchData"
  computed: mapState(["searchData"]),
  methods: {}
};
</script>