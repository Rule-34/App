<template>
  <!-- Icon -->
  <div class="border-util rounded-full shadow bg-elevation relative">
    <!-- Button -->
    <button type="button" class="flex p-1" @click="toggleNotifications()">
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

          <!-- Only show if theres a new notification -->
          <g v-if="newNotification">
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
        <!-- Repeat for every notification -->
        <ContentContainer
          v-for="notification in notificationData.data"
          :key="notification.title"
          class="m-1"
          :title="notification.title"
          :text="notification.description"
          :link="notification.link"
          :link-text="notification.linkText"
        >
          <!-- Workaround for having two links -->
          <template v-if="notification.secondaryText" slot="extra">
            -
            <a
              class="text-sm"
              :href="notification.secondaryLink"
              v-text="notification.secondaryText"
            />
          </template>
        </ContentContainer>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
// Components
import ContentContainer from '~/components/content/ContentContainer.vue'

export default {
  name: 'Notifications',

  components: { ContentContainer },

  data() {
    return {
      isActive: false,
    }
  },

  computed: {
    ...mapState(['notificationData']),

    // Returns true if fetched notifications are different than the local notifications by comparing the last title (Or first)
    newNotification() {
      return this.notificationData.data.length
        ? this.notificationData.latestTitle.localeCompare(
            this.notificationData.data[0].title
          )
        : false
    },
  },

  mounted() {
    // Test if we have already fetched data
    if (this.notificationData.alreadyFetched) {
      console.debug('Already fetched notification data, skipping')
      return
    }

    // Fetch notifications, once as its in mounted (Could potentially waste data if visitors arent on Dashboard)
    this.fetchWithMode({
      mode: 'notifications',
    })
  },

  methods: {
    ...mapActions(['fetchWithMode']),
    ...mapMutations(['notificationManager']),

    toggleNotifications() {
      this.isActive = !this.isActive

      this.notificationManager({ mode: 'setLatestTitle' })
    },
  },
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
