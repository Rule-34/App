<template>
  <!-- Loop for every info container -->
  <div :class="{ zoom: userSettings.zoom.value }" class="container">
    <!-- If separator -->
    <template v-if="separator">
      <div class="material-container p-3 bg-gradient-blue-lilac">
        <div class="text-center text-white">
          <!-- Head -->
          <div :class="{'mb-2': text}">
            <h1 v-text="title" class="text-lg" :class="{underline: titleUnderline}" />
          </div>

          <!-- Body -->
          <div v-if="text" class="text-sm">
            <p v-text="text" class="mb-1"></p>
            <!-- Slot for extra info -->
          </div>
        </div>
      </div>
    </template>

    <!-- If normal post -->
    <template v-else>
      <div :class="{ 'text-center': separator }" class="material-container p-3">
        <!-- Head -->
        <div class="flex inline-flex align-middle">
          <InfoIcon v-if="icon === 'info'" class="mr-2 text-blue-500" />
          <StarIcon v-else-if="icon === 'star'" class="mr-2 text-yellow-500" />
          <DollarSignIcon v-else-if="icon === 'donation'" class="mr-2 text-green-500" />
          <!-- Title -->
          <h1 v-text="title" class="text-default-text text-lg font-bold" />
        </div>

        <!-- Body -->
        <div class="text-sm text-default-text">
          <p v-if="text" v-text="text" class="mb-1 whitespace-pre-line" />

          <slot name="textRich" class="mb-1" />
          <!-- We can insert extra info here -->

          <!-- Image -->
          <picture v-if="img">
            <source :srcset="img + '.webp'" type="image/webp" />
            <source :srcset="img + '.png'" type="image/png" />
            <img :src="img + '.png'" :alt="title + ' Example'" class="mx-auto mt-2" />
          </picture>

          <!-- Links -->
          <a
            v-if="link && linkText"
            :href="link"
            v-text="linkText"
            target="_blank"
            rel="noopener noreferrer"
          />
          <!-- Slot for extra info -->
          <slot />
        </div>
      </div>
    </template>
  </div>
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
    img: { type: String, required: false, default: undefined },
  },
  computed: mapState(['userSettings']),
}
</script>
