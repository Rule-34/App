<template>
  <!-- Loop for every info container -->
  <article
    class="material-container"
    :class="{ zoom: userSettings.zoom.value }"
  >
    <!-- If separator -->
    <template v-if="separator">
      <div class="p-3 bg-gradient-blue-lilac">
        <div class="text-center text-default-text">
          <!-- Head -->
          <h1
            :class="{ underline: titleUnderline }"
            class="text-lg font-bold tracking-wide"
            v-text="title"
          />
          <!-- Body -->
          <p v-if="text" class="mb-1" v-text="text" />
        </div>
      </div>
    </template>

    <!-- If normal post -->
    <template v-else>
      <!-- Sets icon bg if icon is defined -->
      <div
        class="p-3 text-default-text"
        :class="{ [icon]: icon, 'bg-svg': icon }"
      >
        <!-- Title -->
        <h1 class="text-lg font-bold tracking-wide" v-text="title" />

        <!-- Text -->
        <p v-if="text" class="text-sm mb-1 whitespace-pre-line" v-text="text" />

        <!-- We can insert extra info here -->
        <slot class="mb-1" />

        <!-- Image -->
        <picture v-if="img">
          <source :srcset="img + '.webp'" type="image/webp" />
          <source :srcset="img + '.png'" type="image/png" />
          <img
            :loading="userSettings.lazyLoading.value ? 'lazy' : 'auto'"
            :src="img + '.png'"
            :alt="title + ' Example'"
            class="mx-auto mt-2"
          />
        </picture>

        <!-- Links -->
        <a
          v-if="link"
          :href="link"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm"
          v-text="linkText"
        />
        <!-- Slot for extra info -->
        <slot name="extra" />
      </div>
    </template>
  </article>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ContentContainer',

  props: {
    // For separating text
    separator: { type: Boolean, required: false, default: false },
    titleUnderline: { type: Boolean, required: false, default: false },
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

  computed: mapState(['userSettings'])
}
</script>
