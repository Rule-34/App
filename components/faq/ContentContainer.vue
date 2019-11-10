<template>
  <!-- Loop for every info container -->
  <div class="card-container" :class="{ zoom: userSettings.zoom.value }">
    <div class="material-container p-3">
      <!-- Head -->
      <div class="flex inline-flex align-middle mb-2">
        <InfoIcon v-if="icon === 'info'" class="mr-2 text-blue-500" />
        <StarIcon v-else-if="icon === 'star'" class="mr-2 text-yellow-500" />
        <DollarSignIcon
          v-else-if="icon === 'donation'"
          class="mr-2 text-green-500"
        />
        <h1 class="text-lg" v-text="title"></h1>
      </div>

      <!-- Body -->
      <div class="text-sm">
        <p
          v-if="text"
          class="mb-1"
          :class="{ 'whitespace-pre-line': text }"
          v-text="text"
        ></p>

        <slot name="textRich" />
        <!-- We can insert extra info here -->

        <!-- Image -->
        <img
          v-if="img"
          class="mx-auto mt-2"
          :src="img"
          :alt="title + ' Example'"
        />
        <!-- Links -->
        <a
          v-if="link && linkText"
          :href="link"
          target="_blank"
          rel="noopener noreferrer"
          v-text="linkText"
        />
        <!-- Slot for extra info -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { InfoIcon, StarIcon, DollarSignIcon } from "vue-feather-icons";

export default {
  name: "ContentContainer",
  components: { InfoIcon, StarIcon, DollarSignIcon },
  props: {
    title: { type: String, required: true },
    text: { type: String, required: false, default: undefined },
    // For links
    link: { type: String, required: false, default: undefined },
    linkText: { type: String, required: false, default: undefined },
    // For icons
    icon: { type: String, required: false, default: undefined },
    // For images
    img: { type: String, required: false, default: undefined }
  },
  computed: mapState(["userSettings"])
};
</script>
