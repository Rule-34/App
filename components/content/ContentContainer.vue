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
          <div>
            <InfoIcon
              v-if="icon === 'info'"
              class="icon text-blue-500 w-8 h-8"
            />
            <StarIcon
              v-else-if="icon === 'star'"
              class="icon text-yellow-500 w-8 h-8"
            />
            <DollarSignIcon
              v-else-if="icon === 'donation'"
              class="icon text-green-500 w-8 h-8"
            />
          </div>
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
import { InfoIcon, StarIcon, DollarSignIcon } from 'vue-feather-icons'

export default {
  name: 'ContentContainer',

  components: { InfoIcon, StarIcon, DollarSignIcon },

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
