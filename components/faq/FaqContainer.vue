<template>
  <!-- Loop for every info container -->
  <div class="card-container">
    <div class="material-container p-3">
      <!-- Head -->
      <div class="flex inline-flex align-middle mb-2">
        <InfoIcon class="icon text-green-500" />
        <h1 class="ml-2 text-lg" v-text="title"></h1>
      </div>

      <!-- Body -->
      <div class="text-sm">
        <p class="mb-1" v-text="text"></p>
        <!-- We can insert extra info here -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { InfoIcon } from "vue-feather-icons";

export default {
  name: "FaqContainer",
  components: { InfoIcon },
  props: {
    title: { type: String, required: true },
    text: { type: String, required: true }
  }
};
</script>
