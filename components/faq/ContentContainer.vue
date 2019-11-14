<template>
  <!-- Loop for every info container -->
  <div class="container" :class="{ zoom: userSettings.zoom.value }">
    <!-- If separator -->
    <template v-if="separator">
      <div class="material-container p-3 bg-gradient-blue-lilac">
        <div class="text-center text-white">
          <!-- Head -->
          <div class="mb-2">
            <h1 class="text-lg underline" v-text="title"></h1>
          </div>

          <!-- Body -->
          <div v-if="text" class="text-sm">
            <p class="mb-1" v-text="text"></p>
            <!-- Slot for extra info -->
          </div>
        </div>
      </div>
    </template>

    <!-- If normal post -->
    <template v-else>
      <div class="material-container p-3" :class="{ 'text-center': separator }">
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
          <p v-if="text" class="mb-1 whitespace-pre-line" v-text="text" />

          <slot name="textRich" />
          <!-- We can insert extra info here -->

          <!-- Image -->
          <picture v-if="img">
            <source :srcset="img + '.webp'" type="image/webp" />
            <source :srcset="img + '.png'" type="image/png" />
            <img
              class="mx-auto mt-2"
              :src="img + '.png'"
              :alt="title + ' Example'"
            />
          </picture>

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
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { InfoIcon, StarIcon, DollarSignIcon } from "vue-feather-icons";

export default {
  name: "ContentContainer",
  components: { InfoIcon, StarIcon, DollarSignIcon },
  props: {
    // For separating text
    separator: { type: Boolean, required: false, default: false },
    // For normal usage
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
