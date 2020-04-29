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
        :class="{ 'bg-svg': icon, [icon]: icon, [iconPosition]: icon }"
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
    iconPosition: { type: String, required: false, default: 'bg-svg-right' },
    // For images
    img: { type: String, required: false, default: undefined },
  },

  computed: mapState(['userSettings']),
}
</script>

<style lang="postcss">
/* Center positioned */
.bg-svg {
  background-repeat: no-repeat;
  background-size: 35%;
  background-attachment: fixed;
}

/* Right positioned */
.bg-svg-center {
  background-position: center;
}

/* Right positioned */
.bg-svg-right {
  background-position: top 20vh right 5vw;
}

@screen md {
  .bg-svg {
    background-size: 25%;
    /* The percentage is made based on the md screen padding of the layout (md:w-1/3) which is 66.6% plus the percentage of the base background position */

    /* Now its a completely arbitrary digit since I dont understand how background-position wants to work  */
  }

  .bg-svg-right {
    background-position: top 20vh right 20vw;
  }
}

@screen xl {
  .bg-svg {
    background-size: 15%;
  }

  .bg-svg-right {
    background-position: top 20vh right 28vw;
  }
}

/* Types of icons */
.bg-svg-info {
  background-image: url('~assets/img/svg/info.svg');
}

.bg-svg-star {
  background-image: url('~assets/img/svg/star.svg');
}

.bg-svg-dollar {
  background-image: url('~assets/img/svg/dollar.svg');
}
</style>
