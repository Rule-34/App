<template>
  <!-- Loop for every info container -->
  <div class="card-container">
    <div class="material-container p-3">
      <!-- Head -->
      <div class="flex inline-flex align-middle mb-2">
        <InfoIcon v-if="icon === 'info'" class="text-blue-500" />
        <StarIcon v-else-if="icon === 'star'" class="text-yellow-500" />
        <DollarSignIcon
          v-else-if="icon === 'donation'"
          class="text-green-500"
        />
        <h1 class="ml-2 text-lg" v-text="title"></h1>
      </div>

      <!-- Body -->
      <div class="text-sm">
        <p class="mb-1" v-text="text"></p>
        <!-- We can insert extra info here -->
        <a
          v-if="link && linkText"
          :href="link"
          target="_blank"
          rel="noopener noreferrer"
          v-text="linkText"
        ></a>
        <!-- Slot for extra info -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { InfoIcon, StarIcon, DollarSignIcon } from "vue-feather-icons";

export default {
  name: "FaqContainer",
  components: { InfoIcon, StarIcon, DollarSignIcon },
  props: {
    title: { type: String, required: true },
    text: { type: String, required: true },
    link: { type: String, required: false, default: undefined },
    linkText: { type: String, required: false, default: undefined },
    icon: { type: String, required: false, default: "info" }
  }
};
</script>
