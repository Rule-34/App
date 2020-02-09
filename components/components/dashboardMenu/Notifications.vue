<template>
  <!-- Icon -->
  <div class="border-util rounded-full shadow bg-elevation relative">
    <!-- Button -->
    <button type="button" class="flex p-1" @click="isActive = !isActive">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 24 24"
        class="w-5 h-5"
      >
        <g fill="none">
          <!-- Notification bell -->
          <path
            class="icon fill-current text-default-text-muted"
            d="M15 19a3 3 0 11-6 0h6zm3.13-2H5.87C4.838 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2s5.611 2.686 5.611 6v2l2.142 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264z"
          />
          <g v-if="notifications">
            <!-- Bell with a little cut -->
            <path
              class="icon fill-current text-default-text-muted"
              d="M12.338 2.01a6 6 0 005.274 7.977V10l2.141 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264H5.871C4.837 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2c.113 0 .226.004.338.01zM15 19a3 3 0 11-6 0h6z"
            />
            <!-- Notification dot -->
            <circle
              cx="18"
              cy="4.25"
              r="4"
              stroke="hsla(205, 78%, 62%, 0.3)"
              class="icon fill-current text-primary"
            />
          </g>
        </g>
      </svg>
    </button>

    <!-- Content -->
    <transition name="page">
      <div v-if="isActive" class="notifications--details">
        <!-- Donations needed -->
        <ContentContainer
          class="m-1"
          title="Donations needed"
          text="We have been reaching our daily image limit for some days now, when that happens all images stop loading and so does the App.

          If you could support the app donating, even one dollar, we would be able to raise the limit!
          
          More information on Discord."
          icon="bg-svg-dollar"
          icon-position="bg-svg-right"
          link="https://www.patreon.com/VoidlessSeven7"
          link-text="Patreon"
        />

        <!-- Social  -->
        <ContentContainer
          class="m-1"
          title="Social"
          text="Did you know that we have both Discord and Twitter?"
          icon="bg-svg-dollar"
          icon-position="bg-svg-right"
          link="https://twitter.com/Rule34App"
          link-text="Twitter"
        >
          <!-- Workaround for having two links -->
          <template>
            <a class="text-sm" href="https://discord.gg/fUhYHSZ">Discord</a>
            |
          </template>
        </ContentContainer>
      </div>
    </transition>
  </div>
</template>

<script>
import ContentContainer from '~/components/content/ContentContainer.vue'

export default {
  name: 'Notifications',

  components: { ContentContainer },

  data() {
    return {
      notifications: true,
      isActive: false
    }
  }
}
</script>

<style>
.notifications--details {
  /* Offset a little so its more natural */
  top: 120%;
  right: -15px;

  /* Width */
  min-width: 80vw;

  @apply absolute z-10 overflow-hidden;
}

@screen md {
  .notifications--details {
    min-width: 20vw;
  }
}
</style>
