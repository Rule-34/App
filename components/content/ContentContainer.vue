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
      <div class="p-3 flex">
        <!-- Head -->
        <div class="my-auto mr-3">
          <!-- Icons -->
          <svg
            v-if="icon === 'info'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon text-blue-500 w-8 h-8"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h0" />
          </svg>

          <svg
            v-else-if="icon === 'star'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon text-yellow-500 w-8 h-8"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>

          <svg
            v-else-if="icon === 'donation'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon text-green-500 w-8 h-8 feather feather-dollar-sign"
            viewBox="0 0 24 24"
          >
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>

        <!-- Body -->
        <div class="text-sm text-default-text">
          <!-- Title -->
          <h1
            class="text-default-text text-lg font-bold tracking-wide"
            v-text="title"
          />

          <!-- Text -->
          <p v-if="text" class="mb-1 whitespace-pre-line" v-text="text" />

          <slot name="textRich" class="mb-1" />
          <!-- We can insert extra info here -->

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
